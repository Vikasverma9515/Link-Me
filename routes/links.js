// const express = require('express');
// const router = express.Router();
// const axios = require('axios');



// router.get('/', async (req, res) => {
//     if (!req.session.user) return res.redirect('/auth/login');
  
//     const { sort = 'name' } = req.query;  // Default to sorting by name
//     const userId = req.session.user.id;
  
//     try {
//       // Query to get links for the logged-in user
//       let query = 'SELECT * FROM links WHERE user_id = $1';
//       let params = [userId];
  
//       // Apply sorting based on the 'sort' parameter
//       if (sort === 'name') {
//         query += ' ORDER BY name ASC';  // Alphabetically
//       } else if (sort === 'date') {
//         query += ' ORDER BY created_at DESC';  // Recently Added
//       }
  
//       // Execute the query
//       const result = await req.app.locals.db.query(query, params);
  
//       // Render the dashboard page with the sorted links
//       res.render('dashboard', {
//         links: result.rows,
//         sortBy: sort  // Keep track of the selected sorting option
//       });
//     } catch (err) {
//       console.error('Error in fetching links:', err);
//       res.redirect('/');
//     }
//   });


  
//   router.post('/add', async (req, res) => {
//     const { name, url } = req.body;
//     const diceBearApiUrl = process.env.DICEBEAR_API;
//     try {
//       // Generate DiceBear avatar URL using the "Adventurer Neutral" style and a seed based on the link name
//       const imageUrl = `${diceBearApiUrl}${encodeURIComponent(name)}`;
  
//       console.log('Generated DiceBear Avatar URL:', imageUrl );
  
//       // Save the link and avatar URL to the database
//       await req.app.locals.db.query(
//         'INSERT INTO links (name, url, image_url, user_id) VALUES ($1, $2, $3, $4)',
//         [name, url, imageUrl , req.session.user.id]
//       );
  
//       res.redirect('/links');
//     } catch (err) {
//       console.error('Error in adding link:', err);
//       res.redirect('/links');
//     }
//   });
  

// router.post('/delete', async (req, res) => {
//     let linkIds = req.body.delete_ids;
  
//     // If only one link is selected, make sure it's an array
//     if (typeof linkIds === 'string') {
//       linkIds = [linkIds];
//     }
  
//     if (!linkIds || linkIds.length === 0) {
//       return res.redirect('/links');
//     }
  
//     try {
//       const deleteQuery = 'DELETE FROM links WHERE id = ANY($1) AND user_id = $2';
//       await req.app.locals.db.query(deleteQuery, [linkIds, req.session.user.id]);
//       res.redirect('/links');
//     } catch (err) {
//       console.error('Error in deleting links:', err);
//       res.redirect('/links');
//     }
//   });
  

// // Route to update the note for a specific link
// router.post('/update-note', async (req, res) => {
//     const { link_id, note } = req.body;
  
//     if (!link_id || !note) {
//       return res.redirect('/links'); // Ensure the link_id and note are provided
//     }
  
//     try {
//       await req.app.locals.db.query(
//         'UPDATE links SET notes = $1 WHERE id = $2 AND user_id = $3',
//         [note, link_id, req.session.user.id]
//       );
//       res.redirect('/links');
//     } catch (err) {
//       console.error('Error in updating note:', err);
//       res.redirect('/links');
//     }
//   });
  
//   router.post('/contact', async (req, res) => {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//         return res.redirect('/contact?error=All+fields+are+required');
//     }

//     try {
//         // Insert the form data into your database
//         await req.app.locals.db.query(
//             'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
//             [name, email, message]
//         );

//         // Redirect with a success message
//         res.redirect('/contact?success=Your+message+has+been+sent!');
//     } catch (err) {
//         console.error('Error saving contact message:', err);
//         res.redirect('/contact?error=An+error+occurred.+Please+try+again.');
//     }
// });

// module.exports = router;

// firebase

const express = require('express');
const router = express.Router();

// In your links.js route
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  
  const db = req.app.locals.db;
  const userId = req.session.user.username;
  const { sortBy = 'date' } = req.query; // Default to 'date' if not provided

  try {
    let linksRef = db.collection('links').where('userId', '==', userId);
    
    if (sortBy === 'name') {
      linksRef = linksRef.orderBy('name');  // Sort by name
    } else {
      linksRef = linksRef.orderBy('createdAt', 'desc');  // Sort by date (default)
    }

    const snapshot = await linksRef.get();

    const links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render('dashboard', { links, sortBy });
  } catch (err) {
    console.error('Error in fetching links:', err);
    res.redirect('/');
  }
});


// Add Link
// router.post('/add', async (req, res) => {
//   const { name, url } = req.body;

//   try {
//     const db = req.app.locals.db;
//     const userId = req.session.user.username;

//     const link = { name, url, userId, createdAt: new Date() };
//     await db.collection('links').add(link);
//     res.redirect('/links');
//   } catch (err) {
//     console.error('Error in adding link:', err);
//     res.redirect('/links');
//   }
// });
const { getFirestore } = require('firebase-admin/firestore');

router.post('/add', async (req, res) => {
  const { name, url } = req.body;
  const diceBearApiUrl = process.env.DICEBEAR_API; // The DiceBear API URL

  try {
    // Generate DiceBear avatar URL using the "Adventurer Neutral" style and a seed based on the link name
    const imageUrl = `${diceBearApiUrl}${encodeURIComponent(name)}`;
    
    console.log('Generated DiceBear Avatar URL:', imageUrl);
    
    // Initialize Firestore
    const db = req.app.locals.db; // Assuming Firestore instance is in app.locals
    const userId = req.session.user.username; // Assuming username is stored in session
    
    // Create a link object to be added to Firestore
    const link = {
      name,
      url,
      image_url: imageUrl,
      userId,
      createdAt: new Date(), // Add a timestamp for when the link was created
    };
    
    // Add the link object to Firestore in 'links' collection
    await db.collection('links').add(link);
    
    res.redirect('/links');
  } catch (err) {
    console.error('Error in adding link:', err);
    res.redirect('/links');
  }
});


router.post('/delete', async (req, res) => {
  const { delete_ids } = req.body;

  if (!delete_ids) {
    return res.redirect('/links');
  }

  try {
    const db = req.app.locals.db;
    const userId = req.session.user.username;

    const deletePromises = Array.isArray(delete_ids)
      ? delete_ids.map(id => db.collection('links').doc(id).delete())
      : [db.collection('links').doc(delete_ids).delete()];

    await Promise.all(deletePromises);
    res.redirect('/links');
  } catch (err) {
    console.error('Error in deleting links:', err);
    res.redirect('/links');
  }
});

module.exports = router;
