# DB Viewer

## Description
A way to let your users make their own changes to tables in a database. 

# To-Do List 

# User Stories:
<!-- As a basic user, I want to be able to login and logout so that I can access the application whenever I want
    - Login / Logout Front-End Components
    - User Information DB Component
    - Don't need a signup page because the user won't be signing up 
As a basic user, I want to be able to see the tables that I am assigned to be able to see which tables that I have access to
As a basic user, I want to be able to click on the tables to see what information is stored inside 
As a basic user, I want to be able to edit information in the tables to make sure the tables have all of the correct information
As a basic user, I want to be able to save the changes that I made to have my changes become permanent 
As a basic user, I want to be able to see the history of my changes to see what my last changes were and correct them if necessary (optional)
As a basic user, I want to be able to manage my login information to guarantee my usability of the application
As an admin, I want to be able to add users so that the users can go in and edit the information
As an admin, I want to be able to  -->

# User Stories MVP:
1. As a basic user, I want to be able to see the list of tables that I have access to 
2. As a basic user, I want to be able to edit the rows, columns, and values of that table 
3. As a basic user, I want to be able to save my changes 

# Back-End Tasks 
General Tasks:
    - DB Connection 
    - SQL Query Executor
    - 
1. As a basic user, I want to be able to see the list of tables that I have access to 
    - Create route to get table names
2. As a basic user, I want to be able to edit the rows, columns, and values of that table 
    - Create route to get table information 
        - Need to make something that gets only a certain amount of information at a time, we know that some of these tables could have a crazy amount of records / rows 
        
    - Create something that either stores the changes or list of changes that can then be run in a batch?
3. As a basic user, I want to be able to save my changes 
    - Create a route that upon save sends all of the updates to the database.

NOTES:
- So if we use pooling, then we can automatically send the updates to the database everytime something is changed and doesn't need to be in a batch
-



# Front-End Tasks
1. As a basic user, I want to be able to see the list of tables that I have access to 
    - Create a sidebar that has the list of tables that the user can access 
        - This is where we will get the list of table names and stuff and use that route created in the backend 
2. As a basic user, I want to be able to edit the rows, columns, and values of that table 
    - Need to have a way to display all of the table data and initialize that view
    - Need to have a pay to do like a page style view to make sure the user is only looking at x amount of rows at a time
    - Perhaps include something that lets the user select how many records they'd like to view that doesn't burden the front-end/back-end too much
    - Either the table that is shown is already editable or a button that can allow editing 
    - Need to create a callback that updates the values when the values is changed on screen 
    - If the user stops editing in the middle of it, need to keep the old values in the front-end mem so they can be restored 
    - Columns + rows need to be emphasized in terms of styling 
3. As a basic user, I want to be able to save my changes 
    - I want to be able to see a button that shows my changes have been saved, could also be a feature that shows the save time
    - Perhaps a successful save banner / message/ etc...
    - Maybe execute a callback which sends the updates back to the DB 
    - I will want something to stop the user in case they decide to refresh / leave the page stopping them from doing it unless saved
    - Should we keep their changes or leave them if they refresh?

