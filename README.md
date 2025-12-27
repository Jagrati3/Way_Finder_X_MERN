# Way_Finder_X_MERN
🌍 (WayfinderX)

Way_Finder_X is a travel listings web application where users can
add places, view details, and leave reviews.

This project is built using Node.js, Express, MongoDB, and EJS.

✨ Features

📌 View all travel listings

➕ Add a new listing

✏️ Edit existing listings

🗑️ Delete listings

⭐ Add reviews to listings

❌ Delete reviews

🖼️ Image support for listings

🎨 Clean UI using Bootstrap

🛠️ Tech Stack
Technology	Used For
Node.js	Backend runtime
Express.js	Server & routing
MongoDB	Database
Mongoose	MongoDB ODM
EJS	Templating engine
Bootstrap	Styling
Joi	Form validation
Method-Override	PUT & DELETE requests
📁 Project Structure
WanderLust/
│
├── models/
│   ├── listing.js
│   └── review.js
│
├── views/
│   ├── listings/
│   │   ├── index.ejs
│   │   ├── show.ejs
│   │   ├── new.ejs
│   │   └── edit.ejs
│   └── layouts/
│       └── boilerplate.ejs
│
├── public/
│   └── css/
│       └── style.css
│
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── schema.js
├── app.js
└── README.md

⚙️ Installation Steps

Follow these steps to run the project on your system.

1️⃣ Clone the repository
git clone https://github.com/your-username/WanderLust.git

2️⃣ Go inside project folder
cd WanderLust

3️⃣ Install dependencies
npm install

4️⃣ Start MongoDB

Make sure MongoDB is running locally.

mongod

5️⃣ Run the server
nodemon app.js


or

node app.js

🌐 Open in Browser
http://localhost:8080

🧾 Routes Overview
Listings
Method	Route	Description
GET	/listings	Show all listings
GET	/listings/new	Create new listing
POST	/listings	Save listing
GET	/listings/:id	Show listing details
GET	/listings/:id/edit	Edit listing
PUT	/listings/:id	Update listing
DELETE	/listings/:id	Delete listing
Reviews
Method	Route	Description
POST	/listings/:id/reviews	Add review
DELETE	/listings/:id/reviews/:reviewId	Delete review
🧪 Validation

Joi is used for form validation

Errors are handled using a custom ExpressError class

Async errors are managed with wrapAsync

📌 Current Status

✅ Listings CRUD working

✅ Reviews add & delete working

❌ Authentication not added yet (planned)

🚀 Future Improvements

User login & signup

Authorization (only owner can delete)

Image upload with Cloudinary

Ratings average calculation

Better UI animations
