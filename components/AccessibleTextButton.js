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
import { string, bool, func } from 'prop-types'

export default class AccessibleTextButton extends React.Component {
  static propTypes = {
    title: string,
    disabled: bool,
    onPress: func.isRequired,
  }

  static defaultProps = {
    title: '',
    disabled: false,
  }

  onPress = () => {
    const { disabled, onPress } = this.props
    if (disabled) { return false }
    return onPress()
  }

  render() {
    const { title, disabled, style, textStyle, accessibilityLabel, children } = this.props
    const { buttonContainer, buttonTextStyle, dimmedTextStyle } = styles
    let accessibilityTraits = ['button']

    if (disabled) {
      accessibilityTraits.push('disabled')
    }

    return (
      <View
        accessible
        accessibilityTraits={accessibilityTraits}
        style={[buttonContainer, style]}
        accessibilityLabel={accessibilityLabel || title}
      >
        <TouchableOpacity onPress={this.onPress}>
          <Text style={[buttonTextStyle, textStyle, disabled ? dimmedTextStyle : null]}>{title}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#c7ccd6',
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonTextStyle: {
    textAlign: 'center',
    fontSize: 18,
    color: 'blue',
  },
  dimmedTextStyle: {
    color: 'grey',
  },
});
