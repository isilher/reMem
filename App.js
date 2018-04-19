import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.authenticate = this.authenticate.bind(this)

    this.state = {
      authenticated: false,
    }
  }

  async authenticate() {
    const fingerPrintResult = await Expo.Fingerprint.authenticateAsync('Your notes are safe. Unlock them with your fingerprint')
    if (fingerPrintResult.success) {
      this.setState({ authenticated: true })
    } else {
      if (fingerPrintResult.error === "user_fallback") {
        // Handle manual login
      }
    }
  }

  logOut = () => {
    this.setState({ authenticated: false })
  }

  renderTouchIdAuth = () => {
    return(
      <View>
        <Button title="Log in with Touch ID" onPress={this.authenticate} />
      </View>
    )
  }

  renderLogin = () => {
    return (
      <View style={styles.container}>
        {
          Expo.Fingerprint.hasHardwareAsync() && Expo.Fingerprint.isEnrolledAsync()
          ? this.renderTouchIdAuth()
          : <Text>This app only works on devices with Touch ID.</Text>
        }
      </View>
    );
  }

  render() {
    if (!this.state.authenticated) { return this.renderLogin() }

    return (
      <View style={styles.container}>
        <Text>You are logged in!</Text>
        <Button title="Log out" onPress={this.logOut} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
