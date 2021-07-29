let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user;
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (status) => {
    const notesRef = firebase.database().ref(`users/${googleUserId.uid}`).orderByChild('status').equalTo(status);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log(data)
        renderDataAsHtml(data);
    });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  data = sortByTitle(data)
  data.forEach((item) => {
    cards += createCard(item[1], item[0])
  })
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
   return `
     <div class="column is-one-quarter">
       <div class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div class="card-content">
           <div class="content">${note.text}</div>
         </div>
         <footer class="card-footer">
            <a href="#" class="card-footer-item" onclick="deleteNoteModal('${noteId}')">
                Delete
            </a>
            <a href="#" class="card-footer-item" onclick="editNote('${noteId}')">
                Edit
            </a>
            <a href="#" class="card-footer-item" onclick="archiveNote('${noteId}')">
                Archive
            </a>
         </footer>
       </div>
     </div>
   `;
};


const deleteNoteModal = (noteId) => {
    const deleteNoteModal = document.querySelector('#deleteNoteModal')
    deleteNoteModal.querySelector('#deleteNoteId').value = noteId
    deleteNoteModal.classList.toggle('is-active')
}

const deleteNote = () => {
    const deleteNoteId = document.querySelector('#deleteNoteId').value;
    firebase.database().ref(`users/${googleUserId}/${deleteNoteId}`).remove();
    closeDeleteNoteModal()
}


const editNote = (noteId) => {
    const editNoteModal = document.querySelector('#editNoteModal')

    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`)
    notesRef.on('value', (snapshot) => {
        const note = snapshot.val()
        document.querySelector('#editTitleInput').value = note.title
        document.querySelector('#editTextInput').value = note.text
        document.querySelector('#noteId').value = noteId
    })
    editNoteModal.classList.toggle('is-active')
}


const saveEditedNote = () => {
    const title = document.querySelector('#editTitleInput').value
    const text = document.querySelector('#editTextInput').value
    const noteId = document.querySelector('#noteId').value
    const editedNote = { title, text}
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote)
    editNoteModal.classList.toggle('is-active')
}


const closeEditModal = () => {
    // I don't have to define editNoteModal here but it works??
    editNoteModal.classList.toggle('is-active')
}

const closeDeleteNoteModal = () => {
    const deleteNoteModal = document.querySelector('#deleteNoteModal')
    deleteNoteModal.classList.toggle('is-active')
}

const archiveNote = (noteId) => {
    firebase.database().ref(`users/${googleUserId.uid}/${noteId}`).update({status: 'archived'})
}

// From https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
const sortByTitle = (data) => {
    // Create items array
    var items = Object.keys(data).map(function(key) {
        return [key, data[key]];
    });

    // Sort the array based on the second element
    return items.sort(function(first, second) {
        return first[1].title - second[1].title;
    });
}