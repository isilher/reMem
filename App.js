import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';

const TOUCH_ID_AVAILABLE = Expo.Fingerprint.hasHardwareAsync() && Expo.Fingerprint.isEnrolledAsync()

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.checkPin = this.checkPin.bind(this)
    this.setPin = this.setPin.bind(this)
    this.destroyPin = this.destroyPin.bind(this)
    this.authenticateWithTouch = this.authenticateWithTouch.bind(this)
    this.authenticateWithTouch = this.authenticateWithTouch.bind(this)
    this.authenticateWithPin = this.authenticateWithPin.bind(this)

    this.state = {
      authenticated: false,
      pinSet: false,
      pinText: '',
    }
  }

  componentDidMount() {
    this.checkPin()
  }

  async checkPin() {
    const result = await Expo.SecureStore.getItemAsync('reMem-pin')
    console.log('checkPin result: ', result)
    if (result) {
      this.setState({ pinSet: true })
    }
  }

  async setPin() {
    const result = await Expo.SecureStore.setItemAsync('reMem-pin', this.state.pinText)
    console.log('setPin result: ', result)
    this.setState({ authenticated: true, pinSet: true, pinText: '' })
  }

  async authenticateWithTouch() {
    const fingerPrintResult = await Expo.Fingerprint.authenticateAsync('Your notes are safe. Unlock them with your fingerprint')
    if (fingerPrintResult.success) {
      this.setState({ authenticated: true })
    } else {
      if (fingerPrintResult.error === "user_fallback") {
        this.pinInputField.focus()
      }
    }
  }

  logOut = () => {
    this.setState({ authenticated: false })
  }

  async authenticateWithPin() {
    const result = await Expo.SecureStore.getItemAsync('reMem-pin')
    if (result) {
      if(result === this.state.pinText) {
        this.setState({ authenticated: true })
      }
      this.setState({ pinText: '' })
    }
  }

  async destroyPin() {
    const result = await Expo.SecureStore.deleteItemAsync('reMem-pin')
    this.setState({ authenticated: false, pinSet: false })
  }

  changePinText = (pinText) => {
    this.setState({ pinText })
  }

  renderTouchIdAuth = () => {
    return(
      <View style={styles.touchIdButtonWrapperStyle}>
        <TouchableOpacity onPress={this.authenticateWithTouch}>
          <Image
            source={require('./assets/touch-id.png')}
            style={styles.touchIdButtonStyle}
          />
        </TouchableOpacity>
      </View>
    )
  }

  pinInput = (input) => {
    this.pinInputField = input
  }

  renderPinInput = () => {
    return (
      <TextInput
        secureTextEntry
        value={this.state.pinText}
        style={styles.pinInputStyle}
        placeholder="pin"
        onChangeText={this.changePinText}
        ref={this.pinInput}
        keyboardType="numeric"
        autoCorrect={false}
      />
    )
  }

  renderLogin = () => {
    return (
      <View style={styles.mainContainer}>
        <Text style={styles.titleStyle}>
          Welcome user!
        </Text>
        <Text style={styles.subTitleStyle}>
          Please log in with your pin code.
        </Text>
        { this.renderPinInput() }
        <Button
          title="Log in with pin"
          onPress={this.authenticateWithPin}
          disabled={this.state.pinText.length < 5}
        />
        { TOUCH_ID_AVAILABLE && this.renderTouchIdAuth() }
      </View>
    );
  }

  renderRegistration = () => {
    return (
      <View style={styles.mainContainer}>
        <Text style={styles.titleStyle}>
          Welcome new user!
        </Text>
        <Text style={styles.subTitleStyle}>
          Please set a pincode to protect your notes.
        </Text>
        { this.renderPinInput() }
        <Button
          title="Set pin"
          onPress={this.setPin}
          disabled={this.state.pinText.length < 5}
        />
      </View>
    );
  }

  renderContent = () => {
    if (!this.state.pinSet) { return this.renderRegistration() }
    if (!this.state.authenticated) { return this.renderLogin() }

    return (
      <View style={styles.mainContainer}>
        <Text style={styles.titleStyle}>Your notes:</Text>
        <View style={styles.notesContainer}>
          <View style={styles.noteStyle}>
            <Text style={styles.noteTextStyle}>
              Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur purus sit amet fermentum.
            </Text>
          </View>
        </View>
        <View style={styles.notesContainer}>
          <View style={styles.noteStyle}>
            <Text style={styles.noteTextStyle}>
              Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nullam quis risus eget urna mollis ornare vel eu leo.
            </Text>
          </View>
        </View>
        <Button title="Log out" onPress={this.logOut} />
        <Button title="Destroy pin" onPress={this.destroyPin} />
      </View>
    )
  }

  render() {
    return (
      <ImageBackground
        source={require('./assets/pen-bg.png')}
        style={styles.bgImageStyle}
      >
        {this.renderContent()}
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 100,
    alignItems: 'center',
  },
  bgImageStyle: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  titleStyle: {
    marginBottom: 20,
    fontSize: 30,
  },
  subTitleStyle: {
    marginBottom: 15,
    fontSize: 18,
  },
  pinInputStyle: {
    height: 50,
    width: '60%',
    borderWidth: 1,
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 24,
  },
  touchIdButtonWrapperStyle: {
    marginVertical: 30,
  },
  touchIdButtonStyle: {
    width: 100,
    height: 100,
  },
  notesContainer: {
    flex: 1,
  },
  noteStyle: {
    flex: 1,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
  },
  noteTextStyle: {
    fontSize: 18,
  },
});
