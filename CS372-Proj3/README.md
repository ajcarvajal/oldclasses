```
  ____        _   _   _        _____                  
 |  _ \      | | | | | |      |  __ \                 
 | |_) | __ _| |_| |_| | ___  | |__) |__  _ __   __ _ 
 |  _ < / _` | __| __| |/ _ \ |  ___/ _ \| '_ \ / _` |
 | |_) | (_| | |_| |_| |  __/ | |  | (_) | | | | (_| |
 |____/ \__,_|\__|\__|_|\___| |_|   \___/|_| |_|\__, |
                                                 __/ |
                                                |___/ 
                                                
```                                                
Battle Pong game for 2-8 players 



The idea of this game is a general Pong game with a varying amounts of players.  
If there are only 2 players then it becomes a standard rectangle with 2 sides:  ▭  
But if there are 3 players you gain a third side and the area becomes a triangle : △  
4 players it is a square : ▢  
5 players it is a pentagon : ⬠  
6 players it is a hexagon: 	⬡  
etc

Anything past 8 is just a more rounded circle but if we want to we can do it just kind of boring. 

Each player has a paddle about 1/4 to 1/2 the size of their side, controls are very limited you can only move left or right on your side. You lose a point if the ball goes past you into your side, and the person who last touched the ball when it goes into your side gains a point. 

[If you look at this video the rules make more sense](https://youtu.be/9mz-WmzgZyo?t=9) . This is how our game will work but we don't have to do the A to curve the ball at least initially. 

The idea is for this to work locally with 4+ controllers at first but would like to be able to play on separate computers over the web. Using Unity we should be able to compile/play with no disparity between Linux, Windows, and OSX. 


Stretch goals: 
* Online play
* Powerups
* Custom character models
* random events 

We are using in addition to plain git, [the Git Large File Storage addon](https://git-lfs.github.com/):  
  To install on Linux : ** curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash **  
  To track files : git lfs track " [filename or \*.extension] "  +   git add .gitattributes     
  This is useful if we get files over 50MB which can happen.
  
Note: Do not use the Github for Unity plugin it is trash, use the terminal.
