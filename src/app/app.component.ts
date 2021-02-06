import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'agora-demo';

  // async startBasicCall() {
  //   /**
  //    * Put the following code snippets here.
  //    */
  // }

  async agorafnc() {
    const client: IAgoraRTCClient = AgoraRTC.createClient({
      mode: 'live',
      codec: 'vp8',
    });

    const rtc = {
      // For the local client.
      client: null,
      // For the local audio and video tracks.
      localAudioTrack: null,
      localVideoTrack: null,
    };

    const options = {
      // Pass your app ID here.
      appId: '78978ea208fc4826a38f5802881ba739',
      // Set the channel name.
      channel: 'team-kouno',
      // Pass a token if your project enables the App Certificate.
      token: null,
    };
    // Query the container to which the remote stream belong.
    const remoteContainer = document.getElementById('remote-container');

    // Add video streams to the container.
    function addVideoStream(elementId) {
      // Creates a new div for every stream
      const streamDiv = document.createElement('div');
      // Assigns the elementId to the div.
      streamDiv.id = elementId;
      // Takes care of the lateral inversion
      streamDiv.style.transform = 'rotateY(180deg)';
      // Adds the div to the container.
      remoteContainer.appendChild(streamDiv);
    }

    // Remove the video stream from the container.
    function removeVideoStream(elementId) {
      const remoteDiv = document.getElementById(elementId);
      if (remoteDiv) {
        remoteDiv.parentNode.removeChild(remoteDiv);
      }
    }
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // startBasicCall();
    // Create an audio track from the audio sampled by a microphone.
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Create a video track from the video captured by a camera.
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    // Publish the local audio and video tracks to the channel.
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log('publish success!');

    rtc.client.on('user-published', async (user, mediaType) => {
      // Subscribe to a remote user.
      await rtc.client.subscribe(user, mediaType);
      console.log('subscribe success');

      // If the subscribed track is video.
      if (mediaType === 'video') {
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        const playerContainer = document.createElement('div');
        // Specify the ID of the DIV container. You can use the `uid` of the remote user.
        playerContainer.id = user.uid.toString();
        playerContainer.style.width = '640px';
        playerContainer.style.height = '480px';
        document.body.append(playerContainer);

        // Play the remote video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack.play(playerContainer);

        // Or just pass the ID of the DIV container.
        // remoteVideoTrack.play(playerContainer.id);
      }

      // If the subscribed track is audio.
      if (mediaType === 'audio') {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack.play();
      }
    });

    rtc.client.on('user-unpublished', (user) => {
      // Get the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid);
      // Destroy the container.
      playerContainer.remove();
    });

    async function leaveCall() {
      // Destroy the local audio and video tracks.
      rtc.localAudioTrack.close();
      rtc.localVideoTrack.close();

      // Traverse all remote users.
      rtc.client.remoteUsers.forEach((user) => {
        // Destroy the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
      });

      // Leave the channel.
      await rtc.client.leave();
    }
  }

  ngOnInit() {
    this.agorafnc();
  }
}
