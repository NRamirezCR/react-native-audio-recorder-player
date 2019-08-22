
import {
  NativeModules,
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import { EventEmitter } from 'fbemitter';

const { RNAudioRecorderPlayer } = NativeModules;

const pad = (num) => {
  return ('0' + num).slice(-2);
};

const emitter = () => {
  if (Platform.OS === 'android') return DeviceEventEmitter;
  return new NativeEventEmitter(RNAudioRecorderPlayer);
};

class AudioRecorderPlayer {
  _currentPosition;
  _duration;

  _emitter;

  _isRecording;
  _isPlaying;

  _recorderSubscription;
  _playerSubscription;

  constructor({ uri } = {}) {
    this._uri = uri || 'DEFAULT';
    this._emitter = new EventEmitter();
  }

  _setNativeRecordBackListener = () => {
    this._recorderSubscription = emitter().addListener('rn-recordback', (e) => {
      if (!this.isRecording) return;
      this._emitter.emit('recordback', e);
    });
  }

  _unsetNativeRecordBackListener = () => {
    if (this._recorderSubscription) {
      this._recorderSubscription.remove();
      this._recorderSubscription = null;
    }
  }

  _setNativePlayBackListener = () => {
    this._playerSubscription = emitter().addListener('rn-playback', ({ current_position, duration }) => { // eslint-disable-line camelcase
      if (!this.isPlaying) return;
      this._currentPosition = parseFloat(current_position);
      this._duration = parseFloat(duration);
      this._emitter.emit('playback', { current_position, duration });

      if (current_position === duration) this.stopPlayer(); // eslint-disable-line camelcase
    });
  }

  _unsetNativePlayBackListener = () => {
    if (this._playerSubscription) {
      this._playerSubscription.remove();
      this._playerSubscription = null;
    }
  }

  mmss = (secs) => {
    let minutes = Math.floor(secs / 60);
    secs = secs % 60;
    minutes = minutes % 60;
    // minutes = ('0' + minutes).slice(-2);
    // secs = ('0' + secs).slice(-2);
    return pad(minutes) + ':' + pad(secs);
  }

  mmssss = (milisecs) => {
    const secs = Math.floor(milisecs / 1000);
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const miliseconds = Math.floor((milisecs % 1000) / 10);
    console.log('milisecs: ' + milisecs);
    console.log('min: ' + minutes + ', secs: ' + seconds + ', ' + miliseconds);
    return pad(minutes) + ':' + pad(seconds) + ':' + pad(miliseconds);
  };

  /**
   * set listerner from native module for recorder.
   * @returns {callBack(e: Event)}
   */
  addRecordBackListener = (cb) => {
    const sub = this._emitter.addListener('recordback', cb);
    return () => sub.remove();
  }

  /**
   * remove listener for recorder.
   * @returns {void}
   */
  removeRecordBackListener = () => {
    this._emitter.removeAllListeners('recordback');
  }

  /**
   * set listener from native module for player.
   * @returns {callBack(e: Event)}
   */
  addPlayBackListener = (cb) => {
    const sub = this._emitter.addListener('playback', cb);
    return () => sub.remove();
  }

  /**
   * remove listener for player.
   * @returns {void}
   */
  removePlayBackListener = () => {
    this._emitter.removeAllListeners('playback');
  }

  /**
   * set listener from native module for player.
   * @returns {callBack(e: Event)}
   */
  addPlayBackEndListener = (cb) => {
    const sub = this._emitter.addListener('playback-end', cb);
    return () => sub.remove();
  }

  /**
   * remove listener for player.
   * @returns {void}
   */
  removePlayBackEndListener = () => {
    this._emitter.removeAllListeners('playback-end');
  }

  /**
   * start recording with param.
   * @param {string} uri audio uri.
   * @returns {Promise<string>}
   */
  startRecorder = async() => {
    if (!this._isRecording) {
      this._isRecording = true;
      this._setNativeRecordBackListener();
      return RNAudioRecorderPlayer.startRecorder(this._uri);
    }
    console.log('Already recording');
  }

  /**
   * stop recording.
   * @returns {Promise<string>}
   */
  stopRecorder = async() => {
    if (this._isRecording) {
      this._isRecording = false;
      this._unsetNativeRecordBackListener();
      return RNAudioRecorderPlayer.stopRecorder();
    }
    console.log('Already stopped recording');
  }

  /**
   * resume playing.
   * @returns {Promise<string>}
   */
  resumePlayer = async() => {
    if (!this._isPlaying) {
      this._isPlaying = true;
      this._setNativePlayBackListener();
      return RNAudioRecorderPlayer.resumePlayer();
    }
    console.log('Already playing');
  }

  /**
   * start playing with param.
   * @param {string} uri audio uri.
   * @returns {Promise<string>}
   */
  startPlayer = async() => {
    if (!this._isPlaying) {
      this._isPlaying = true;
      this._setNativePlayBackListener();
      return RNAudioRecorderPlayer.startPlayer(this._uri);
    }
    console.log('Already started playing');
  }

  /**
   * stop playing.
   * @returns {Promise<string>}
   */
  stopPlayer = async() => {
    if (this._isPlaying) {
      this._currentPosition = 0;
      this._isPlaying = false;
      this._unsetNativePlayBackListener();
      this._emitter.emit('playback-end');
      return RNAudioRecorderPlayer.stopPlayer();
    }
    console.log('Already stopped playing');
  }

  /**
   * pause playing.
   * @returns {Promise<string>}
   */
  pausePlayer = async() => {
    if (this._isPlaying) {
      this._isPlaying = false;
      this._unsetNativePlayBackListener();
      return RNAudioRecorderPlayer.stopPlayer();
    }
    console.log('Already paused or stopped');
  }

  /**
   * seek to.
   * @param {number} time position seek to in second.
   * @returns {Promise<string>}
   */
  seekToPlayer = async(time) => {
    if (Platform.OS === 'ios') {
      time = time / 1000;
    }
    return RNAudioRecorderPlayer.seekToPlayer(time);
  }

  /**
   * set volume.
   * @param {number} setVolume set volume.
   * @returns {Promise<string>}
   */
  setVolume = async(volume) => {
    if (volume < 0 || volume > 1) {
      return console.warn('Value of volume should be between 0.0 to 1.0');
    }
    return RNAudioRecorderPlayer.setVolume(volume);
  }

  /**
   * set subscription duration.
   * @param {number} sec subscription callback duration in seconds.
   * @returns {Promise<string>}
   */
  setSubscriptionDuration = async(sec) => {
    return RNAudioRecorderPlayer.setSubscriptionDuration(sec);
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get isRecording() {
    return this._isRecording;
  }
}

export default AudioRecorderPlayer;
