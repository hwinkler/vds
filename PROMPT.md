Generate a web app using nodejs, React, and Gatsby (for server side page generation).

The app, named vds, manages a fantasy procycling game. 

There will be administrators (admins) and players.

Each year there will be two new games: one for the men teams and one for the women.

At the beginning of the year, Admins will provision the system with  lists of real pro cycling teams, and the riders on them. Teams have full names, and a short acronym, and an icon. Riders have a full name, the team they're on that year, a birth date, their nationality, and a price (an integer).

Assunme Admins can mange the db by manipullating the db via the command line. we don't need a special Admin class of user. Just players.

Players log in at the beginning of the year and build their teams (one or both of men and women teams). While building the team it is not yet playable. Players can build their team across several sessions.  Here are the rules for building teams:

Men's 
    Budget: 150 points (sum of the rider prices)
    Roster Size: 25 riders.
    Point Value Restrictions:
        One rider can cost 24 points or more.
        Only a total of three riders can be valued at 18 points or more (including the 24+ point rider). 
    Rider Selection: You must choose a roster of 25 riders within the point value limits. 

Women's 
    Budget: 150 points.
    Roster Size: 15 riders.
    Point Value Restrictions: You can spend up to 100 points on riders valued at 20 points or higher. 

At a certain deadline date, players may no longer edit theri team for that year. All valid teams (according to the rules above) then participate.

Admins also provision the system with a list of races for that year. A race falls into one of eight categories. Here are the categories and the points assigned to the riders in the order of finishing:


    Grand Tours

        Placing on a stage		100, 40, 30, 20, 10	
        Intermediate leader jersey		20	
        Intermediate points jersey		10	
        Intermediate mountain jersey		10	
        Intermediate other jersey		10	
        Final leader jersey		600, 450, 375, 325, 300, 275, 250, 225, 200, 175, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15	
        Final points jersey		120, 90, 60, 40, 20	
        Final mountain jersey		60, 40, 20	
        Final other jersey		60, 40, 20	

    Monuments and Worlds

        Placing in a 1-day race		350, 300, 275, 250, 225, 200, 175, 150, 125, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5	

    Top Stage Races

        Placing on a stage		50, 25, 10	
        Intermediate leader jersey		6	
        Final leader jersey		250, 200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 40, 30, 15	
        Final points jersey		60, 40, 20	
        Final mountain jersey		60, 40, 20	
        Final other jersey		60, 40, 20	

    Top Classics

        Placing in a 1-day race		250, 200, 180, 160, 140, 120, 100, 90, 80, 70, 60, 50, 40, 30, 15	

    Best of the Rest

        Placing in a 1-day race		150, 125, 100, 80, 60, 50, 40, 30, 20, 10	
        Placing on a stage		40, 20, 10	
        Final leader jersey		150, 125, 100, 80, 60, 50, 40, 30, 20, 10	

    Minor Races

        Placing in a 1-day race		100, 70, 50, 30, 15	
        Placing on a stage		25	
        Final leader jersey		100, 70, 50, 30, 15	

    National Champs

        Placing in a 1-day race		100	

    Hour Record

        Placing in a 1-day race		100	

Keep in mind a one day race has a number of finishers and is simple. 
A stage race is sort of a one-day race for several days in a row. Each
day produces top finishers who score points. It also produces jersey-wearers (for OVERALL leader,
mountain, points, and other) for that
day who score as above. At the end of all the stages there are the final jersey wearers

For simplicity we'll say a 1-day race has one "stage", while a stage race just has multiple stages.

It should use a RDBMS, sqlite. All text columns must be utf-8.

HERE'S a sketch of the tables. I have 

Table `game`
    col `sex`, 'm' or 'f'
    col `year`, the 4 digit int year
    col `deadline` date with time zone
    pk is (year, sex)

Table `pro_team`
    col `sex`
    col `year` 4 digits int
    col `pro_team_name`
    col `icon` blob
    fk (year, sex) to table game
    pk (year, sex, pro_team_name)

Table nationality
    col `nationality` 3 letters

Table `rider`
    col `sex`
    col `year`
    col `rider_name`
    col `pro_team_name`
    col `price` int
    col `nationality` 
    fk (year, sex, pro_team_name) to table team
    fk (nationality) to nationality
    pk(year, sex, rider_name)

Table `player`
    col `player_name`

Table `player_team`
    col `sex`
    col `year` 4 digits int
    col `team_name`  

Table `category`
    col `category`  e.g. 'Best of the Rest'

Table `race`
    col `category`
    col `sex`
    col `race_name`
    pk race_name

Table `stage`
    col `date` date with time zone
    col `race_name`
    col `stage_number`

Table `finisher`
    col `rider_name`
    col `sex`
    col `race_name`
    col `stage_number`
    col `order` (1, 2, 3, ...)
    pk (rider_name, sex, race_name, stage_number, order)
    fk (rider_name, sex) to `rider`
    fk (race_name, stage_number) to `stage`.


web pages
Authentication: Assume users will log in via OAuth2 using Apple, Google, or Facebook identities.

Index:
A list of player teams and their scores. Sorted by descending score by default,
but also sortable by name or score.
Clicking a team name navigates to the Team Results page for it.
A navigation pane links to Team Builder, All Riders, Races, Team results page for logged in user.

Team builder:
A page for a useer to build a team: either men or women.
They select to build a men or womne team, and they type a team name.
They must see a list of all riders (a long list, about 1000 long, so scrollable).
They must see the riders' name, age, nationality, pro_team, and price, and be able to sort by any ofthose columns and filter. As they tick checkboxes for riders to add, the added riders appear to the right in a second list with all their data. 

It's ok for users to build invalid teams temporarily (too many or too few riders, 
or violation of the rules for price limitations)

But they should see a list of violations that prevent their team from being valid.
There's a Save button to save chnages, and a Reset button to discard.

Team results:
A page displaying the list of riders for one team and their total scores for all races
so far. Sortable by rider name or score.
Also, displays the teams total score.


All riders:
All riders listed by name, nationality, pro team, and their total score for all races.
Sortable by any column.

Races:
Liast of all races with any finishers so far. Each row links to a a page showing the race results

Race Results:
for each "stage" (even one day races), the list of scoring finishers in order and their points for that finish. Also for stage races, show the jersey wearers for each stage and the points awarded. If a stage race has completed show the final jersey wearers too and their points.
