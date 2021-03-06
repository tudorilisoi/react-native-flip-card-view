// @see https://github.com/yasemincidem/Flip-Card

import React from "react";
import {Animated, View, Easing, InteractionManager} from "react-native";
import PropTypes from 'prop-types';
import {screen} from 'src/style'
import _ from 'lodash';
import connectstore from "src/lib/thinflux/src/connectstore"
import store from 'src/store'
import Loader from 'src/unicenta/components/Loader'


const computeStyles = (containerSize) => {
    return {
        animatedFace: {
            position: 'absolute',
            top: 0,
            left: 0,
            // flex: 1,
            width: containerSize.width,
            height: containerSize.height,
            overflow: 'hidden',
        },
        animatedContainer: {
            overflow: 'hidden',
            width: containerSize.width,
            height: containerSize.height
        }
    }
}

class FlipCard extends React.PureComponent {

    static propTypes = {
        containerSize: PropTypes.object.isRequired, //{width,height}
        style: PropTypes.any,
        flipped: PropTypes.bool,
        renderFront: PropTypes.any.isRequired,
        renderBack: PropTypes.any.isRequired,
        onStart: PropTypes.func,
        onEnd: PropTypes.func,
    }

    static
    defaultProps = {
        style: null,
        initiallyFlipped: false,
        onStart: _.noop,
        onEnd: _.noop,
    }

    constructor(props) {
        super(props);
        const initial = props.flipped ? 1 : 0
        this.flipped = initial
        this.state = {
            animatedValue: new Animated.Value(initial),
            isFlipped: new Animated.Value(initial),
            animating: false,
        }

        //using negative left position to prevent touches on the hidden face

        this.state.frontPosition = Animated.multiply(this.state.isFlipped, -300 * screen.width)
        this.state.backPosition = Animated.multiply(Animated.add(this.state.isFlipped, -1), 300 * screen.vmax)


        this.lastFlip = false
        this.state.animatedValue.addListener((valueObj) => {
            const flipped = valueObj.value >= 0.5
            const lastFlip = this.lastFlip
            this.lastFlip = flipped
            if (lastFlip !== flipped) {
                this.state.isFlipped.setValue(flipped ? 1 : 0)
            }
        });

    }

    componentDidUpdate(prevProps) {
        if (prevProps.flipped !== this.props.flipped) {
            this.doFlip()
        }
    }

    componentWillUnmount() {
        this.state.animatedValue.removeAllListeners();
    }

    isFlipped = () => this.flipped

    setFlip = (flipped) => {
        this.flipped = !this.flipped
        this.state.animatedValue.setValue(flipped ? 1 : 0)
    }

    doFlip = () => {

        this.flipped = !this.flipped

        const {onStart, onEnd} = this.props
        // onStart()
        Animated.timing(this.state.animatedValue, {
            useNativeDriver: true,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            toValue: this.flipped ? 1 : 0
        }).start(() => {
            console.log('ANIMATION DONE');
            // onEnd()
            return true
        })
    }


    render() {
        console.log('RENDER FLIP');
        const styles = computeStyles(this.props.containerSize)

        const rotateYFront = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '-90deg', '180deg']
        });

        const rotateYBack = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['180deg', '90deg', '0deg']
        });

        const frontFaceStyle = [
            styles.animatedFace, {
                transform: [
                    {perspective: 1000},
                    {rotateY: rotateYFront},
                    {translateY: this.state.frontPosition},
                    // {translateX: this.state.frontPosition},
                ]
            }
        ]
        const backFaceStyle = [
            styles.animatedFace,
            {
                transform: [
                    {perspective: 1000},
                    {rotateY: rotateYBack},
                    {translateY: this.state.backPosition},
                    // {translateX: this.state.backPosition},
                ]
            }
        ]

        return (

            //NOTE renderToHardwareTextureAndroid enables great anim perf
            //if memory problems/GPU problems, enable before animating and disable afterwards

            <View
                key={'flip-wrapper'}
                style={[styles.animatedContainer, this.props.style]}>

                <Animated.View
                    key={'back'}
                    renderToHardwareTextureAndroid={true}
                    shouldRasterizeIOS={true}
                    useNativeDriver
                    style={backFaceStyle}>
                    {this.flippedCardView(true)}
                </Animated.View>

                <Animated.View
                    key={'front'}
                    renderToHardwareTextureAndroid={true}
                    shouldRasterizeIOS={true}
                    useNativeDriver
                    style={frontFaceStyle}>
                    {this.flippedCardView(false)}
                </Animated.View>

            </View>
        )
    }


    flippedCardView = (isFlipped) => {
        if (!isFlipped) {
            return this.props.renderFront
        } else {
            return this.state.animating && false ? (<Loader/>) :
                this.props.renderBack
        }
    }
}

// export default FlipCard;

const {restaurant} = store.actions
export default connectstore(store, FlipCard, {
    flipMode: store.actions.ui.FLIP_MODE_PATH,
    // currentOrder: restaurant.CURRENT_ORDER_PATH,
    // tableID: restaurant.CURRENT_TABLE_PATH,
}, function map(values) {
    console.log('VALUES', values);
    return {flipped: values.flipMode === store.actions.ui.FLIP_MODE_TICKET}
})
