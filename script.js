let currentsong = new Audio();
let songs;
let currfolder;
console.log("js");


// Get references for the control buttons
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(
        decodeURIComponent(element.href.split(`${folder}`)[1])
      );
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  // Set the source for the currentsong using the current folder and the encoded track name
  currentsong.src = `${currfolder}` + encodeURIComponent(track);
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Render the playlist UI with the songs in the global "songs" array
function renderPlaylist() {
  let songul = document.querySelector(".songlist ul");
  songul.innerHTML = ""; // Clear any existing content
  for (const song of songs) {
    let displayName = song
      .replaceAll("%20", " ")
      .replaceAll("ezmp3.cc", " ")
      .replaceAll("5B", " ")
      .replaceAll("5D", " ")
      .replaceAll("(Official Music Video)", " ");
    songul.innerHTML += `<li data-track="${song}"> 
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${displayName}</div>
                    <div>Gogoi</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
               </li>`;
  }

  // Re-attach event listeners for each playlist item
  Array.from(songul.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      let track = e.getAttribute("data-track");
      console.log("Playing:", track);
      playMusic(track);
    });
  });
}

async function main() {
  // Load the initial playlist from the ncs folder
  await getsongs("songs/ncs");
  renderPlaylist();
  playMusic(songs[0], true);

async function displayName() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach(e=>{
        if(e.href.includes("/songs")){
            console.log(e.href.split("/").slice(-2)[0]);

            //  get the metadata of the folder
            
        }
    })
    console.log(anchors);

    
}

//   display all the albums on the page


  // Toggle play/pause on click of the play button
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  // Update the time display and seek bar as the song plays
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // Seek functionality on clicking the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = currentsong.duration * (percent / 100);
  });

  // Hamburger menu and close button event listeners
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button functionality
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let currentTrack = decodeURIComponent(
      currentsong.src.split("/").slice(-1)[0]
    );
    let index = songs.indexOf(currentTrack);
    console.log("Decoded Track:", currentTrack);
    console.log("Index:", index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next button functionality
  next.addEventListener("click", () => {
    console.log("next clicked");
    let currentTrack = decodeURIComponent(
      currentsong.src.split("/").slice(-1)[0]
    );
    let index = songs.indexOf(currentTrack);
    console.log("Decoded Track:", currentTrack);
    console.log("Index:", index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    console.log(e, e.target.value);
    currentsong.volume = parseInt(e.target.value) / 100;
  });


//   Add event listener to mute song

document.querySelector(".volume>img").addEventListener("click",e=>{
    console.log(e.target);
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentsong.volume = .10
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})
  // Load a new playlist when a card is clicked (e.g., switching from ncs to cs)
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      // Update the global songs array with the new folder's songs
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      renderPlaylist();
    });
  });
}

main();
