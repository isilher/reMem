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
  AccessibilityInfo,
} from 'react-native';
import AccessibleTextButton from './components/AccessibleTextButton'

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
    this.setUpAccessability = this.setUpAccessability.bind(this)

    this.state = {
      authenticated: false,
      pinSet: false,
      pinText: '',
      screenReaderActive: false,
    }
  }

  componentDidMount() {
    this.checkPin()
    this.setUpAccessability()
  }

  async setUpAccessability() {
    result = await AccessibilityInfo.fetch()
    console.log('screen reader active? ', result)
    this.setState({ screenReaderActive: result })
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
      <View
        accessible
        style={styles.touchIdButtonWrapperStyle}
        accessibilityLabel="Log in with Touch ID"
        accessibilityTraits={['button']}
      >
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
    const blockLogin = this.state.pinText.length < 5

    return (
      <View style={styles.mainContainer}>
        <Text style={styles.titleStyle}>
          Welcome user!
        </Text>
        <Text style={styles.subTitleStyle}>
          Please log in with your pin code.
        </Text>
        { this.renderPinInput() }
        <AccessibleTextButton
          title="Log in with pin"
          onPress={this.authenticateWithPin}
          disabled={blockLogin}
          accessibilityLabel={blockLogin ? 'Log in with pin. Enter your pin code first.' : null}
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
        <AccessibleTextButton
          title="Set pin"
          onPress={this.setPin}
          disabled={this.state.pinText.length < 5}
        />
      </View>
    );
  }

  renderNote = (text, author) => {
    return (
      <View
        accessible
        style={styles.noteStyle}
        accessibilityTraits={['text']}
        accessibilityLabel={`Note: ${text} Author: ${author}`}
      >
        <Text style={styles.noteTextStyle}>{text}</Text>
        <Text style={styles.authorTextStyle}>- {author}</Text>
      </View>
    )
  }

  renderContent = () => {
    if (!this.state.pinSet) { return this.renderRegistration() }
    if (!this.state.authenticated) { return this.renderLogin() }

    return (
      <View style={styles.mainContainer}>
        <Text
          accessible
          style={styles.titleStyle}
          accessibilityTraits={['title']}
        >
          Your notes:
        </Text>
        <View style={styles.notesContainer}>
          {this.renderNote('Be yourself; everyone else is already taken.', 'Oscar Wilde')}
          {this.renderNote('Nothing is impossible, the word itself says "I\'m possible"!', 'Audrey Hepburn')}
          {this.renderNote('Fantasy is hardly an escape from reality. It\'s a way of understanding it.', 'Lloyd Alexander')}
        </View>
        <AccessibleTextButton title="Log out" onPress={this.logOut} />
        <AccessibleTextButton title="Destroy pin" onPress={this.destroyPin} />
      </View>
    )
  }

  render() {
    // Skip the background image for visually impaired users
    if (this.state.screenReaderActive) { return this.renderContent() }

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
  authorTextStyle: {
    color: 'grey',
    fontStyle: 'italic',
    position: 'absolute',
    right: 10,
    bottom: 10,
    textAlign: 'right',
  },
});
