"""Execute exact shipped reference SQL on committed synthetic fixtures.
Optional dev runner: uv run --with duckdb python tests/analytics/revenue-sql.py
No customer data, no network/database writes. DuckDB arithmetic check, not PostgreSQL integration QA.
"""
import datetime
import json
import math
import re
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[2]
REFERENCE = (ROOT / 'skills/financial-models/references/revenue-sql.md').read_text()
FIXTURES = json.loads((Path(__file__).parent / 'revenue-fixtures.json').read_text())


def sql_for(title, fixture):
    section = re.search(r'^## ' + re.escape(title) + r'\n(.*?)(?=^## |\Z)', REFERENCE, re.M | re.S)
    blocks = re.findall(r'```sql\n(.*?)\n```', section.group(1), re.S)
    assert len(blocks) == 1, title
    # Date placeholders only: no rewritten logic, table names, clock or SQL dialect.
    return blocks[0].replace('{report_start}', fixture['start']).replace('{report_end}', fixture['end'])


def prior_month(value):
    date = datetime.date.fromisoformat(value)
    assert date.day == 1
    return (date - datetime.timedelta(days=1)).replace(day=1).isoformat()


def validate_contract(fixture, title):
    calendar = {row[0]: row[1:] for row in fixture['calendar']}
    assert len(calendar) == len(fixture['calendar']), 'duplicate calendar key'
    history = dict(fixture['history'])
    assert len(history) == len(fixture['history']), 'duplicate customer history key'
    assert fixture['start'] <= fixture['end'], 'reversed range'
    current = fixture['end']
    first = prior_month(fixture['start']) if title in ['MRR Waterfall', 'Monthly Churn Rate'] else fixture['start']
    while current >= first:
        assert current in calendar and all(calendar[current]), 'unobserved or incomplete period'
        current = prior_month(current)
    for period, account, plan, mrr in fixture['snapshots']:
        assert account in history, 'missing first-paid history'
        assert account is not None and period is not None and mrr is not None and mrr >= 0, 'invalid snapshot'
        assert period >= history[account], 'revenue precedes first-paid history'
    if title == 'Cohort Revenue Retention':
        for account, first_paid in history.items():
            assert sum(row[3] for row in fixture['snapshots'] if row[0] == first_paid and row[1] == account) > 0, 'missing inception baseline'


def run(title, fixture):
    validate_contract(fixture, title)
    db = duckdb.connect(':memory:')
    db.execute('CREATE TABLE monthly_revenue_snapshots (period DATE, customer_id VARCHAR, plan_name VARCHAR, mrr DECIMAL(18, 4))')
    db.execute('CREATE TABLE revenue_calendar (period DATE, is_closed BOOLEAN, is_complete BOOLEAN)')
    db.execute('CREATE TABLE customer_revenue_history (customer_id VARCHAR, first_paid_period DATE)')
    for table, rows in [('monthly_revenue_snapshots', fixture['snapshots']), ('revenue_calendar', fixture['calendar']), ('customer_revenue_history', fixture['history'])]:
        if rows:
            db.executemany('INSERT INTO ' + table + ' VALUES (' + ','.join('?' for _ in rows[0]) + ')', rows)
    result = db.execute(sql_for(title, fixture))
    keys = [col[0] for col in result.description]
    rows = [dict(zip(keys, row)) for row in result.fetchall()]
    db.close()
    return rows


checks = 0
for fixture in FIXTURES:
    for title, expected in fixture['checks'].items():
        actual = run(title, fixture)
        assert len(actual) == len(expected), (fixture['name'], title, actual)
        for row, want in zip(actual, expected):
            for key, value in want.items():
                got = row[key]
                if isinstance(got, datetime.date):
                    got = got.isoformat()
                if isinstance(value, (int, float)):
                    assert got is not None and math.isclose(float(got), value, abs_tol=1e-9), (fixture['name'], key, got, value)
                else:
                    assert got == value, (fixture['name'], key, got, value)
            if title == 'MRR Waterfall':
                assert row['period'] is not None
                assert row['starting_mrr'] + row['new_mrr'] + row['reactivation_mrr'] + row['expansion_mrr'] - row['contraction_mrr'] - row['churn_mrr'] == row['ending_mrr'], row
        checks += 1
        print('PASS', fixture['name'], '/', title)

# Contract-negative cases: query execution must not hide incomplete/open inputs as zero.
for missing in ['2026-07-01', '2026-08-01']:
    fixture = json.loads(json.dumps(FIXTURES[0]))
    fixture['calendar'] = [row for row in fixture['calendar'] if row[0] != missing]
    try:
        run('MRR Waterfall', fixture)
        raise RuntimeError('missing period was accepted')
    except AssertionError as error:
        assert 'unobserved' in str(error)
    checks += 1
fixture = json.loads(json.dumps(FIXTURES[0]))
fixture['calendar'][1][1] = False
try:
    run('Monthly Churn Rate', fixture)
    raise RuntimeError('open period was accepted')
except AssertionError as error:
    assert 'unobserved' in str(error)
checks += 1
fixture = json.loads(json.dumps(FIXTURES[-1]))
fixture['snapshots'] = [row for row in fixture['snapshots'] if row[0] != '2025-01-01']
try:
    run('Cohort Revenue Retention', fixture)
    raise RuntimeError('missing cohort baseline was accepted')
except AssertionError as error:
    assert 'inception' in str(error)
checks += 1
print(f'{checks} regression checks passed on DuckDB {duckdb.__version__}; PostgreSQL integration not exercised.')
