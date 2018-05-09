import React, { Component } from 'react';
import autoBind from 'react-autobind';
import firebase from 'firebase';
import './styles/App.scss';

const config = {
  apiKey: "AIzaSyCrg72wyq0NAmJgioC-NtjWNzzRNkV3dR4",
  authDomain: "sweetbabycinemas.firebaseapp.com",
  databaseURL: "https://sweetbabycinemas.firebaseio.com",
  projectId: "sweetbabycinemas",
  storageBucket: "gs://sweetbabycinemas.appspot.com/",
  messagingSenderId: "406932741569"
};
firebase.initializeApp(config);

const downloadRef = firebase.storage().ref('movies.json');
const uploadRef = firebase.storage().ref().child('movies.json');

class App extends Component {
  constructor(){
    super()
    autoBind(this);
    this.state = {
      movieList:[{title:'loading ...'}],
      bookingThanks:null
    }
  } 

  componentWillMount(){
    let self = this;
    downloadRef.getDownloadURL().then(function(url){
      var xhr = new XMLHttpRequest();
      xhr.onload = function(event) {
        let movies;
        try{
          movies = JSON.parse(xhr.response);
        }
        catch(ex){
          console.log(ex.toString());
          movies = null;
        }
        if(movies)
          self.sortMovies(movies);
      };
      xhr.open('GET', url, true);
      xhr.send();
    });
  }

  makeBooking(movie){
    var xhr = new XMLHttpRequest();
    var data = `Movie=${movie.title}`;
    let self=this;
    xhr.onload = function(event) {
      self.setState({bookingThanks:movie.title});
    };
    xhr.open('POST', 'https://cinemaemailsender.azurewebsites.net/api/cinema/sendemail/', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(data); 
  }

  saveMovieList(newMovieList){
    let file = JSON.stringify(newMovieList);
    let uploadTask = uploadRef.putString(file);
    uploadTask.on('state_changed', 
    function(snapshot){}, 
    function(error) {}, 
    function() {
      console.log(uploadTask.snapshot.downloadURL);
    });
  }

  sortMovies(newMovieList){   
    newMovieList.sort(function(a,b){
      return b.watched==="1"? -1:1;
    });
    this.setState({movieList:newMovieList});
    this.saveMovieList(newMovieList);
  }

  addMovie(){
    let newMovieList = this.state.movieList.concat({
      title: this.state.title || "Scott Pilgrim",
      desc: this.state.desc || "Very good let's watch it",
      wiki: this.state.wiki || "Scott_Pilgrim_vs._the_World",  
      trailer: this.state.trailer || "7wd5KEaOtm4",
      watched:"0",
    });
    this.sortMovies(newMovieList);
  }

  removeMovie(i){
    let newMovieList = this.state.movieList.slice();
    newMovieList.splice(i,1);
    this.sortMovies(newMovieList);
  }

  setWatchedMovie(i){
    let newMovieList = this.state.movieList;
    newMovieList[i].watched = newMovieList[i].watched==="1"?"0":"1";
    this.sortMovies(newMovieList);
  }

  updateInput = (event) => this.setState({ [event.target.name]: event.target.value });  
  showTrailer = (trailer) => this.setState({trailerLink:trailer});
  redirect = (wiki) => window.open("http://en.wikipedia.org/wiki/"+wiki, '_blank');

  render() {
    let self = this;
    let movieTable = this.state.movieList.map(function(movie, i){
      return (
        <tbody className={movie.watched==="1"? 'watched':'not-watched'} key={i}>
          <tr className='table-button-row'>
            <th>{movie.title}</th>
            <td onClick={() => self.redirect(movie.wiki)}><span aria-label='wiki' role='img'>🌐</span></td>
            <td onClick={() => self.showTrailer(movie.trailer)}>▶</td>          
            <td onClick={() => self.removeMovie(i)}>X</td>
            <td className={`${movie.watched==="1"?'watched':'to-watch'}`} 
              onClick={() => self.setWatchedMovie(i)}>{movie.watched==="1"?'✓':'!'}</td>            
            <td onClick={() => self.makeBooking(movie)}><span aria-label='book' role='img'>🎫</span></td>            
          </tr>
          <tr>
            <td colSpan="6" style={{padding:20}}>{movie.desc}</td>             
          </tr>
        </tbody>
      );
    });

    return (
      <div className="main">
        <div className={`booking-thanks ${this.state.bookingThanks?'':'hide'}`}>
          <div className='close' onClick={() => this.setState({bookingThanks:null})}>X</div>
          Thank you for booking {this.state.bookingThanks}!
        </div>
        <div className='movie-list'>
          <h1>Welcome to Sweet Baby Christmas Cinemas!</h1>
          <h3>Please peruse the xmas options and make a holiday booking</h3>
          <div className={`trailer ${this.state.trailerLink?'show':''}`}>
            <iframe title='trailer' className='frame' src={`https://www.youtube.com/embed/${this.state.trailerLink}`} />
            <div className='close' onClick={() => this.showTrailer(null)}>X</div>
          </div>
          <table>
              {movieTable}
          </table>
        </div>
        <div className='movie-form'>
          <h1>Add a new film</h1>
          <div className='form'>
            <em>title:</em>
            <input name='title' value={this.state.title} onChange={e => this.updateInput(e)}/>
            <em>description:</em>
            <input name='desc' value={this.state.desc} onChange={e => this.updateInput(e)}/>
            <em>wikipedia: en.wikipedia.org/wiki/<strong>This_Part(Film)</strong></em>
            <input name='wiki' value={this.state.wiki} onChange={e => this.updateInput(e)}/>
            <em>trailer: youtube.com/watch?v=<strong>tH15p4rT</strong></em>
            <input name='trailer' value={this.state.trailer} onChange={e => this.updateInput(e)}/>
            <button onClick={() => this.addMovie()}>Submit</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;