import React from "react";
import {Animated, View, Easing} from "react-native";
import PropTypes from 'prop-types';
import {screen} from 'src/style'

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
    }

    static defaultProps = {
        style: null,
    }

    constructor() {
        super();

        this.state = {
            animatedValue: new Animated.Value(0),
            isFlipped: new Animated.Value(0),
        }

        this.state.animatedValue.addListener((valueObj) => {
            const flipped = valueObj.value >= 0.5
            this.state.isFlipped.setValue(flipped ? 1 : 0)
            // console.log('ANIM', valueObj.value, flipped);
        });

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

        Animated.timing(this.state.animatedValue, {
            useNativeDriver: true,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            toValue: this.flipped ? 1 : 0
        }).start(() => {
            // console.log('ANIMATION DONE');
            return true
        })
    };

    render() {
        console.log('RENDER');
        const styles = computeStyles(this.props.containerSize)

        const rotateYFront = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '-90deg', '180deg']
        });

        const rotateYBack = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['180deg', '90deg', '0deg']
        });


        //using negative left position to prevent touches on the hidden face
        const positionFront = this.state.isFlipped.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -screen.vmax * 150],
            extrapolate: 'clamp',
        });

        const positionBack = this.state.isFlipped.interpolate({
            inputRange: [0, 1],
            outputRange: [-screen.vmax * 150, 0],
            extrapolate: 'clamp',
        });

        const frontFaceStyle = [
            styles.animatedFace, {
                transform: [
                    {perspective: 1000},
                    {rotateY: rotateYFront},
                    {translateY: positionFront},
                    // {translateX: positionFront},
                ]
            }
        ]
        const backFaceStyle = [
            styles.animatedFace,
            {
                transform: [
                    {perspective: 1000},
                    {rotateY: rotateYBack},
                    {translateY: positionBack},
                    // {translateX: positionBack},
                ]
            }
        ]

        return (

            //NOTE renderToHardwareTextureAndroid enables great anim perf
            //if memory problems/GPU problems, enable before animating and disable afterwards

            <View
                style={[styles.animatedContainer, this.props.style]}>

                <Animated.View
                    renderToHardwareTextureAndroid={true}
                    shouldRasterizeIOS={true}
                    useNativeDriver
                    style={backFaceStyle}>
                    {this.flippedCardView(true)}
                </Animated.View>

                <Animated.View
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
            return this.props.renderBack
        }
    }
}

module.exports = FlipCard;
