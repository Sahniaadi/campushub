# 🚀 CampusHub Deployment Guide (Render & Vercel)

Now that you have the complete CampusHub application running locally, here is a step-by-step guide to deploying it to production so that anyone on the internet can access it. We will use **Render** for the Backend API and MongoDB database, and **Vercel** for the Frontend React app.

---

## ☁️ Step 1: Prepare Your Database (MongoDB Atlas)
Since your current database is local, you need a cloud database for production.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a new free "Shared" cluster.
3. In **Database Access**, create a database user and password.
4. In **Network Access**, add the IP address `0.0.0.0/0` to allow access from anywhere.
5. Click **Connect** on your cluster, choose "Connect your application", and copy the connection string.
   *(It will look like: `mongodb+srv://<username>:<password>@cluster0.../campushub`)*

---

## ⚙️ Step 2: Deploy the Backend (Render)
Render is an excellent free platform for hosting Node.js APIs.

1. **Upload your code to GitHub**: Push your entire `system edu` codebase to a public or private GitHub repository.
2. Sign up for [Render.com](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub account and select your repository.
5. **Configuration Details:**
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (Make sure backend/package.json has `"start": "node server.js"`)
6. **Environment Variables:** Scroll down and add the following keys:
   - `PORT`: `5000`
   - `MONGODB_URI`: *(Paste the Atlas URL from Step 1)*
   - `JWT_SECRET`: *(A random strong string like `prod_secret_campushub_123`)*
   - `OPENAI_API_KEY`: *(Optional - your OpenAI key)*
7. Click **Create Web Service**. Render will deploy your backend and give you a live URL (e.g., `https://campushub-api.onrender.com`).

---

## 🎨 Step 3: Deploy the Frontend (Vercel)
Vercel handles React applications effortlessly and provides global edge-caching.

1. First, inside `frontend/.env.production` (create this file), add your new Render backend URL:
   `REACT_APP_API_URL=https://campushub-api.onrender.com/api`
2. Push this change to your GitHub repository.
3. Sign up for [Vercel](https://vercel.com).
4. Click **Add New...** -> **Project**.
5. Connect your GitHub account and import your repository.
6. **Configuration Details:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend` (Click Edit to set this!)
   - **Build Command:** `npm run build`
7. **Environment Variables:**
   - Name: `REACT_APP_API_URL` 
   - Value: `https://campushub-api.onrender.com/api`
8. Click **Deploy**. Vercel will build the frontend and provide you with a live, secure `https://` domain for your application!

---

Congratulations! 🎉 Your Advanced Student Platform is now live on the internet! 
*If you need to make changes, simply push updates to your GitHub repository, and Render/Vercel will automatically redeploy the new code.*
