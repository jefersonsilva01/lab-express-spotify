require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
  res.render('search');
})

app.get('/artist-search', (req, res) => {
  const artist = req.query.artist;

  spotifyApi
    .searchArtists(artist)
    .then(data => {
      console.log('The received data from API: ', data.body.artists.items);
      let artistsSearched = data.body.artists.items.map(item => {
        let obj = { id: item.id, name: item.name };

        if (item.images[0]) {
          obj['image'] = item.images[0].url
        } else {
          obj['image'] = 'https://picsum.photos/200';
        };

        return obj;
      });
      res.render('artist-search-results', { artistsSearched });
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:id/artist/:name', (req, res) => {
  const id = req.params.id;
  const name = req.params.name;

  spotifyApi
    .getArtistAlbums(id)
    .then(data => {
      console.log('Albums from artist API ', data.body.items)
      let albumsSearched = data.body.items.map(item => {
        let obj = { id: item.id, name: item.name };

        if (item.images[0]) {
          obj['image'] = item.images[0].url
        } else {
          obj['image'] = 'https://picsum.photos/200';
        };

        return obj;
      });
      res.render('albums', [{ albumsSearched }, name]);
    })
    .catch(err => console.log('An error occurred: ', err));
});

app.get('/tracks/:id', (req, res) => {
  const id = req.params.id;

  spotifyApi
    .getAlbumTracks(id)
    .then(data => {
      console.log("Tracks from albums API ", data.body.items)

      let = tracksSearched = data.body.items;
      res.render('tracks', { tracksSearched });
    })
    .catch(err => console.log('An error occurred: ', err));
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
