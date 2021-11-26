# Dispatch Messenger

## How to Launch
1. Make sure you have ```npm```, ```nodemon``` and ```node``` installed
2. Run ```git clone https://github.com/HrikB/dispatch-messenger-mern.git```
3. Run ```cd dispatch-messenger-mern```
4. Open two more terminals in the /dispatch-messenger-mern directory
5. Run ```cd frontend``` in one and ```cd backend-mern``` in another
6. Run ```npm install``` in both those terminals
7. Run ```cd backend-mern``` in the final terminal
8. In the frontend run ```npm start```
9. In the backend terminals run ```npm run authStart``` and ```npm run dataStart```
10. The app should be accessible on localhost:3000
11. The auth and data servers will be running on localhost:8000 and localhost:7000 respectively

## Motivation
The motivation behind this project was to familiarize myself with MERN stack. As this was my first web development project, I wanted to create something quite large and comprehensive to truly push myself to learn as much as possible. The tech stack encompasses a lot and throwing myself into the deep end is the way I learn best, so I decided to plunge right in.

## Tech Stack
* ReactJS 
* Redux 
* MaterialUI 
* MongoDB 
* ExpressJS 
* NodeJS 
* Joi 
* Redis 
* Socket-IO 
* JSONWebToken 
* Gridfs 
* Multer

## Architechture
<img width="536" alt="Dispatch Architecture" src="https://user-images.githubusercontent.com/23041116/143404431-a80c8d0a-4623-44e3-ab86-e990b13149a8.PNG">

## Features
* Live 1-to-1 private messaging
* Voice Messages
* Emojis
* Live Friend Request & Adding/Removing
* Profile Updating (Name, Email, Profile Picture)
* Design inspired by Discord and Messenger
