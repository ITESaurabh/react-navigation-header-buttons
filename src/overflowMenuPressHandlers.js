// @flow
import * as React from 'react';
import { Platform, ActionSheetIOS, UIManager, findNodeHandle, typeof View } from 'react-native';
import { HiddenItem } from './HeaderItems';
import invariant from 'invariant';
import type { ToggleMenuParam } from './overflowMenu/OverflowMenuContext';

type OverflowButtonDescriptors = $ReadOnlyArray<{
  title: string,
  onPress: () => void | Promise<void>,
  destructive?: boolean,
  disabled?: boolean,
}>;

export const extractOverflowButtonData = (
  hiddenButtons: React.Node,
  detectedElementTypes: Array<React.StatelessFunctionalComponent<any>> = [HiddenItem]
): OverflowButtonDescriptors => {
  // don't do this at home - this is not how React is meant to be used!
  const btnsData = React.Children.toArray(hiddenButtons).map((button) => {
    const { props, type } = button;
    if (detectedElementTypes.includes(type)) {
      return extract(button);
    }

    if (typeof type === 'function') {
      const nestedElement = callSafe(type, props);
      if (nestedElement && detectedElementTypes.includes(nestedElement.type)) {
        return extract(nestedElement);
      }
    }
    return false;
  });
  // $FlowFixMe
  return btnsData.filter(Boolean);
};

const callSafe = (type, props) => {
  try {
    return type(props);
  } catch {
    return false;
  }
};

const extract = (element: React.Element<any>) => {
  const {
    props: { title, onPress, disabled, destructive },
  } = element;
  return { title, onPress, destructive: destructive === true, disabled: disabled === true };
};

export type OnOverflowMenuPressParams = {
  hiddenButtons: OverflowButtonDescriptors,
  _private_toggleMenu: (ToggleMenuParam) => void,
  overflowButtonRef: null | View,
  cancelButtonLabel?: string,
  children: React.Node,
};

const checkParams = (hiddenButtons) => {
  invariant(Array.isArray(hiddenButtons), 'hiddenButtons must be an array');
};

export const overflowMenuPressHandlerActionSheet = ({
  hiddenButtons,
  cancelButtonLabel = 'Cancel',
}: OnOverflowMenuPressParams) => {
  checkParams(hiddenButtons);
  let actionTitles = hiddenButtons.map((btn) => btn.title);
  actionTitles.unshift(cancelButtonLabel);

  const disabledButtonIndices: Array<number> = (() => {
    let result = [];
    hiddenButtons.forEach((it, index) => {
      if (it.disabled === true) {
        result.push(index + 1);
      }
    });
    return result;
  })();

  const destructiveButtonIndex: Array<number> = (() => {
    let result = [];
    hiddenButtons.forEach((it, index) => {
      if (it.destructive === true) {
        result.push(index + 1);
      }
    });
    return result;
  })();

  ActionSheetIOS.showActionSheetWithOptions(
    // $FlowFixMe - typings are old
    {
      options: actionTitles,
      cancelButtonIndex: 0,
      disabledButtonIndices,
      destructiveButtonIndex,
    },
    (buttonIndex: number) => {
      if (buttonIndex > 0) {
        hiddenButtons[buttonIndex - 1].onPress();
      }
    }
  );
};

export const overflowMenuPressHandlerPopupMenu = ({
  hiddenButtons,
  overflowButtonRef,
}: OnOverflowMenuPressParams) => {
  checkParams(hiddenButtons);
  const enabledButtons = hiddenButtons.filter((it) => it.disabled !== true);

  UIManager.showPopupMenu(
    findNodeHandle(overflowButtonRef),
    enabledButtons.map((btn) => btn.title),
    (err) => console.debug('overflowBtn error', err),
    (eventName: string, index?: number) => {
      if (eventName !== 'itemSelected' || typeof index !== 'number') {
        return;
      }
      enabledButtons[index].onPress();
    }
  );
};

export const overflowMenuPressHandlerDropdownMenu = ({
  children,
  overflowButtonRef,
  _private_toggleMenu,
}: OnOverflowMenuPressParams) => {
  if (overflowButtonRef) {
    // $FlowFixMe
    overflowButtonRef.measureInWindow((x, y, width) => {
      _private_toggleMenu({ elements: children, x: x + width, y });
    });
  } else {
    // TODO ignore or show?
  }
};

export const defaultOnOverflowMenuPress: (OnOverflowMenuPressParams) => void = Platform.select({
  ios: overflowMenuPressHandlerActionSheet,
  default: overflowMenuPressHandlerDropdownMenu,
});
