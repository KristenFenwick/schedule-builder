# schedule-builder

Schedule builder app (WIP, PDF import in progress)

# Schedule Builder

A schedule building app I’ve been developing in React/TypeScript.

This app is a passion project of mine intended for simplistic implementation of a schedule, with 
inspiration from importation of PDFs when completing my taxes. 

As someone who values scheduling and 'juggles' many committments the time it takes to build my planner
can be time consuming. Here's to hoping this is a simple solution to my problem and potentially yours. 

Cheers! To staying positive and testing negative in the process to functionality. :-) 

## Status
Current version is functional, but PDF import is still in progress and is currently undergoing testing 
and unreliable.

## Current Features
- Manual schedule entry
- Timeline display
- Import/export utilities
- Quick-add form support

## Known Issues
- PDF import/parsing is not fully working yet. (For loop issue minor fix) 
- On later versions the PDF library will load correctly but not parse the events distinctly resulting in a rather long list of events at times. 
- Some edge cases may still cause bugs (quite a few!) 
- On later version the time reverts back to military time if text is pasted and a PDF is added in the same run. This was a test case in which the result could have been worse. 
- With newer version (while buggy!) there has been improvement to classification of events with expansion from prior versions. 

## Versions
"Life is a journey, not a destination." - Ralph Waldo Emerson 
- Version 1 (v0.1) is actually my 8th version (+- uncertainty)
- By version 4 (not showcased) the app was functionable with pasted text only. However that was not the end goal and what is shown is slightly closer. 
- v0.1 — stable schedule builder without PDF import
- v0.2 — PDF text extraction works, but event parsing is still inaccurate

# Potential Implementation thoughts 
- Option for time zone preference, Military versus 'meridiem'
- This passion project is still in the development stage. Fine tuning of design is a later process.
-  
