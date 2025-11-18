# AI & Reports Module – Overview (Person 4)

This folder contains all documentation for the **AI logic, focus-loss prediction, and reporting system** used in the Smart Study & Productivity Tracker.  
As Person 4, my role is **design**, not coding — meaning I define how the AI works so the backend and frontend teams can integrate it later.

## What This Module Includes

### 1. AI System Design  
Located in `AI-Module-Design.md`, this explains:
- how the AI processes study sessions  
- how it detects patterns  
- what data it needs from the database  
- what backend API endpoints it requires  
- how reports are generated (student, instructor, admin)

### 2. Focus-Loss Algorithm  
Located in `Algorithm-Focus-Loss.md`, this explains:
- how the AI predicts when a student’s focus will drop  
- the 75% alert rule  
- what the backend should do when an alert is triggered  

### 3. Report Templates  
The `report-templates/` folder contains example JSON outputs for:
- Student weekly report  
- Student monthly report  
- Instructor summary report  
- System diagnostics report  

These templates show the **exact structure** that backend and frontend should follow.

## Purpose of This Folder

This documentation ensures:
- **Backend** knows what endpoints to build  
- **Frontend** knows what data to expect  
- **Database** knows which fields the AI requires  
- **Professor** sees a complete AI system design  

This module prepares the system so AI logic can be implemented in the next phase.
