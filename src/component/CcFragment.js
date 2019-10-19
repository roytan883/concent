import React from 'react';
import { CC_FRAGMENT_PREFIX } from '../support/constant';
import * as util from '../support/util';
import mapRegistrationInfo from '../core/base/map-registration-info';
import beforeUnmount from '../core/base/before-unmount';
import beforeMount from '../core/base/before-mount';
import didMount from '../core/base/did-mount';
import didUpdate from '../core/base/did-update';
import buildRefCtx from '../core/ref/build-ref-ctx';
import getOutProps from '../core/base/get-out-props';
import getStoredKeys from '../core/base/get-stored-keys';
import ccContext from '../cc-context';

const { shallowDiffers, getRegisterOptions } = util;
const { moduleName_stateKeys_ } = ccContext;
const nullSpan = React.createElement('span', { style: { display: 'none' } });

export default class CcFragment extends React.Component {
  constructor(props, context) {
    super(props, context);
    const registerOptions = getRegisterOptions(props.register);

    // 非registerDumb调用，即直接使用<CcFragment />做初始化， 把组件的注册信息映射到ccContext
    if (props.__$$regDumb !== true) {
      const {
        module, renderKeyClasses, tag, lite,
        watchedKeys = '*', connect = {}, reducerModule, state = {}, isSingle,
      } = registerOptions;
      const { ccClassKey, ccKey, ccOption = {} } = props;

      //直接使用<CcFragment />构造的cc实例，把ccOption.storedKeys当作registerStoredKeys
      const { _module, _reducerModule, _watchedKeys, _ccClassKey, _connect } = mapRegistrationInfo(
        module, ccClassKey, renderKeyClasses, CC_FRAGMENT_PREFIX, watchedKeys, ccOption.storedKeys, connect, reducerModule, true
      );

      const storedKeys = getStoredKeys(state, moduleName_stateKeys_[_module], ccOption.storedKeys, []);
      buildRefCtx(this, {
        isSingle, ccKey, connect: _connect, state, module: _module, reducerModule: _reducerModule,
        storedKeys, watchedKeys: _watchedKeys, tag, ccClassKey: _ccClassKey, ccOption, type: CC_FRAGMENT_PREFIX
      }, lite);
    } else {
      const outProps = getOutProps(props);
      const ccOption = outProps.ccOption;
      const storedKeys = getStoredKeys(props.state, moduleName_stateKeys_[props.module], ccOption.storedKeys, props.storedKeys);
      const params = Object.assign({}, props, { storedKeys, ccOption, type: CC_FRAGMENT_PREFIX });
      buildRefCtx(this, params, props.lite);
    }

    this.__$$compareProps = props.compareProps || true;
    //对于concent来说，ctx在constructor里构造完成，此时就可以直接把ctx传递给beforeMount了，
    //无需在将要给废弃的componentWillMount里调用beforeMount
    beforeMount(this, props.setup, props.bindCtxToMethod);
  }

  componentDidMount() {
    didMount(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsChanged = this.__$$compareProps ? shallowDiffers(getOutProps(nextProps), getOutProps(this.props)) : false;
    return this.state !== nextState || isPropsChanged;
  }

  // componentDidUpdate(prevProps, prevState) {
  componentDidUpdate() {
    didUpdate(this);
  }

  componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
    beforeUnmount(this);
  }

  render() {
    //注意这里，一定要每次都取最新的绑在ctx上，确保交给renderProps的ctx参数里的state和props是最新的
    this.ctx.props = getOutProps(this.props);

    const { children, render } = this.props
    const view = render || children;

    if (typeof view === 'function') {
      const { __$$regDumb, mapProps } = this.props;
      const ctx = this.ctx;
      if (__$$regDumb !== true && mapProps) {//直接使用<CcFragment />实例化
        ctx.mapped = mapProps(ctx);
        return view(ctx.mapped) || nullSpan;
      } else {
        return view(ctx) || nullSpan;
      }
    } else {
      if (React.isValidElement(view)) {
        //直接传递dom，无论state怎么改变都不会再次触发渲染
        throw new Error(`CcFragment's children can not b a react dom `);
      }
      return view;
    }
  }

}