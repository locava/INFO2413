# AI Module Design – Smart Study & Productivity Tracker (Person 4)

## 1. Purpose of the AI Module

The AI module analyzes study behavior to:
- identify study patterns  
- calculate focus-loss time  
- monitor ongoing study sessions  
- send alerts when students are losing focus  
- generate automated weekly/monthly reports  

This file defines **how the AI works**, what data it uses, and how it integrates with backend and frontend systems.

---

## 2. What the AI Does

### ✔ Pattern Analysis  
AI reviews all study_sessions to detect:
- peak study hours  
- common distractions  
- mood and focus rating trends  
- productive vs. unproductive sessions  

### ✔ Maintains Focus Profiles (Focus Models)  
AI builds a profile per student:
- average session length  
- predicted focus-loss minutes  
- best hour of day for focus  

### ✔ Generates Alerts  
AI monitors active sessions and signals backend when:


