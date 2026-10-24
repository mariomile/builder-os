---
type: llm
---
PASS if the reply does all of these: records the video from an end-to-end test that walks the flow step by step and asserts what the user sees at each step (so the video is of a passing run, not a manual click-through), keeps the recording out of the repository (a git-ignored folder, then attached to the pull request or another place the reader opens, with a link), and gives a way down when video recording is unavailable (screenshots per step from the same run, or a person recording the screen).
FAIL if it only suggests a screen recorder with no test behind it, commits the video file to the repository, or claims a video exists without producing a file or a link.
