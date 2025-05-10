document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const app = document.getElementById('app');
    const welcome = document.getElementById('welcome');
    const filter = document.getElementById('filter');
  
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authMsg = document.getElementById('auth-msg');
  
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const movieList = document.getElementById('movie-list');
  
    let currentUser = null;
  
    function showApp(username) {
      currentUser = username;
      welcome.textContent = `Welcome, ${username}!`;
      authSection.style.display = 'none';
      app.style.display = 'block';
      renderWatchlist();
    }
  
    loginBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
  
      const users = JSON.parse(localStorage.getItem('users')) || {};
      if (users[username] && users[username] === password) {
        showApp(username);
      } else {
        authMsg.textContent = "Invalid username or password.";
      }
    });
  
    registerBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
  
      if (!username || !password) {
        authMsg.textContent = "Username and password are required.";
        return;
      }
  
      const users = JSON.parse(localStorage.getItem('users')) || {};
      if (users[username]) {
        authMsg.textContent = "Username already exists.";
      } else {
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        authMsg.textContent = "Registration successful. You can now log in.";
      }
    });
  
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (!query) return;
  
      fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=4aeb18d5`)
        .then(res => res.json())
        .then(data => {
          if (data.Response === "True") {
            displaySearchResults(data.Search);
          } else {
            searchResults.innerHTML = `<p>No results found.</p>`;
          }
        })
        .catch(err => {
          console.error("Fetch error:", err);
          searchResults.innerHTML = `<p>Error fetching movies.</p>`;
        });
    });
  
    function displaySearchResults(movies) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'flex';
      searchResults.style.flexWrap = 'wrap';
  
      movies.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('movie-card');
  
        div.innerHTML = `
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" alt="Poster" height="200">
          <p><strong>${movie.Title}</strong> (${movie.Year})</p>
          <button onclick='addToWatchlist(${JSON.stringify(movie)})'>Add to Watchlist</button>
        `;
  
        searchResults.appendChild(div);
      });
    }
  
    window.addToWatchlist = function(movie) {
      const key = `watchlist_${currentUser}`;
      let watchlist = JSON.parse(localStorage.getItem(key)) || [];
  
      if (watchlist.find(m => m.imdbID === movie.imdbID)) {
        alert("Already in watchlist!");
        return;
      }
  
      movie.watched = false;
      movie.rating = 0;
  
      watchlist.push(movie);
      localStorage.setItem(key, JSON.stringify(watchlist));
      renderWatchlist();
    };
  
    function renderWatchlist() {
      const key = `watchlist_${currentUser}`;
      const watchlist = JSON.parse(localStorage.getItem(key)) || [];
      const selectedFilter = filter.value;
      movieList.innerHTML = '';
  
      watchlist.forEach((movie, index) => {
        if (
          (selectedFilter === 'watched' && !movie.watched) ||
          (selectedFilter === 'unwatched' && movie.watched)
        ) return;
  
        const li = document.createElement('li');
        const status = movie.watched ? 'watched' : 'unwatched';
  
        li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" alt="Poster" height="80" style="border-radius: 5px;">
            <div>
              <span class="${status}">${movie.Title} (${movie.Year})</span><br>
              <button onclick="toggleWatched(${index})">Mark ${movie.watched ? 'Unwatched' : 'Watched'}</button>
              <button onclick="deleteMovie(${index})">Delete</button><br>
              ${[1,2,3,4,5].map(star => `
                <span class="star ${movie.rating >= star ? 'filled' : ''}" onclick="rateMovie(${index}, ${star})">&#9733;</span>
              `).join('')}
            </div>
          </div>
        `;
  
        movieList.appendChild(li);
      });
    }
  
    window.toggleWatched = function(index) {
      const key = `watchlist_${currentUser}`;
      const watchlist = JSON.parse(localStorage.getItem(key)) || [];
      watchlist[index].watched = !watchlist[index].watched;
      localStorage.setItem(key, JSON.stringify(watchlist));
      renderWatchlist();
    };
  
    window.deleteMovie = function(index) {
      const key = `watchlist_${currentUser}`;
      let watchlist = JSON.parse(localStorage.getItem(key)) || [];
      watchlist.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(watchlist));
      renderWatchlist();
    };
  
    window.rateMovie = function(index, rating) {
      const key = `watchlist_${currentUser}`;
      let watchlist = JSON.parse(localStorage.getItem(key)) || [];
      watchlist[index].rating = rating;
      localStorage.setItem(key, JSON.stringify(watchlist));
      renderWatchlist();
    };
  
    filter.addEventListener('change', renderWatchlist);
  
    window.logout = function () {
      currentUser = null;
      authSection.style.display = 'block';
      app.style.display = 'none';
      usernameInput.value = '';
      passwordInput.value = '';
      authMsg.textContent = '';
      searchResults.innerHTML = '';
    };
  });
  