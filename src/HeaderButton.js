/**
 * @flow
 */
import * as React from 'react';
const BUTTON_HIT_SLOP = { top: 5, bottom: 5, left: 5, right: 5 };
import { StyleSheet, View } from 'react-native';
import Touchable from 'react-native-platform-touchable';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

type Props = {
  onPress: ?() => any,
  ButtonElement: React.Node,
  buttonWrapperStyle?: StyleObj,
  testID?: string,
};

export class HeaderButton extends React.PureComponent<Props> {
  render() {
    const { ButtonElement, onPress, buttonWrapperStyle, testID } = this.props;
    const RenderedComponent = !onPress ? View : Touchable;

    return (
      <RenderedComponent
        background={Touchable.SelectableBackgroundBorderless()}
        onPress={onPress}
        hitSlop={BUTTON_HIT_SLOP}
        style={[styles.buttonContainer, buttonWrapperStyle]}
        testID={testID}
      >
        <View>{ButtonElement}</View>
      </RenderedComponent>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
