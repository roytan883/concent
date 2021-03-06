import React from 'react';
import * as util from '../support/util';
import beforeUnmount from '../core/base/before-unmount';
import didMount from '../core/base/did-mount';
import didUpdate from '../core/base/did-update';
import getOutProps from '../core/base/get-out-props';
import initCcFrag from '../core/ref/init-cc-frag';
import beforeRender from '../core/ref/before-render';

const { shallowDiffers } = util;
const nullSpan = React.createElement('span', { style: { display: 'none' } });

class CcFragment extends React.Component {
  constructor(props, context) {
    super(props, context);
    initCcFrag(this);
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
    const thisProps = this.props;
    this.ctx.prevProps = this.ctx.props;
    this.ctx.props = getOutProps(thisProps);

    const { children, render } = thisProps;
    const view = render || children;

    if (typeof view === 'function') {
      beforeRender(this);
      const { __$$regDumb, register = {} } = thisProps;
      const ctx = this.ctx;

      if (__$$regDumb !== true && register.mapProps) {//直接使用<CcFragment />实例化
        ctx.mapped = register.mapProps(ctx) || {};
        return view(ctx.mapped) || nullSpan;
      }

      return view(ctx) || nullSpan;
    } else {
      if (React.isValidElement(view)) {
        //直接传递dom，无论state怎么改变都不会再次触发渲染
        throw new Error(`CcFragment's children can not b a react dom `);
      }
      return view;
    }
  }

}

export default CcFragment;