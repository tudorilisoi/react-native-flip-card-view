import React from "react";
import {
    Animated,
    Easing,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    View
} from "react-native";

import {screen} from 'src/style'

const styles = {
    animatedFace: {
        // opacity: .5,
        position: 'absolute',
        top: 0,
        left: 0,
        width: screen.width,
        height: screen.height - screen.navh
    },
    animatedContainer: {
        // flex: 1,
        top: 0,
        left: 0,
        width: screen.width,
        height: screen.height - screen.navh
    }
};

class FlipCard extends React.PureComponent {
    constructor() {
        super();

        this.state = {
            animatedValue: new Animated.Value(0),
            opacityFront: new Animated.Value(1),
            opacityBack: new Animated.Value(0),
            isFlipped: true,
        }

        this.state.animatedValue.addListener((valueObj) => {
            const flipped = valueObj.value >= 0.5
            this.state.opacityBack.setValue(flipped ? 1 : 0)
            this.state.opacityFront.setValue(!flipped ? 1 : 0)
            // console.log('ANIM', valueObj.value, flipped);
        });

    }

    componentDidMount() {
        // this.doFlip()
        window.flipper = this
    }

    setFlip = (flipped) => {
        this.flipped = !this.flipped
        this.state.animatedValue.setValue(flipped ? 1 : 0)
    }

    doFlip = () => {

        this.flipped = !this.flipped
        Animated.spring(this.state.animatedValue, {
            toValue: this.flipped ? 1 : 0,   // Returns to the start
            velocity: this.props.velocity,  // Velocity makes it move
            tension: this.props.tension, // Slow
            friction: this.props.friction,  // Oscillate a lot
        }).start(() => {
            // console.log('ANIMATION DONE');
            return true
        })
    };

    render() {
        console.log('RENDER');

        const rotateYFront = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '-90deg', '180deg']
        });

        const rotateYBack = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['180deg', '-90deg', '0deg']
        });

        const zBack = this.state.opacityBack.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10]
        });

        const zFront = this.state.opacityFront.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10]
        });

        const frontFaceStyle = [
            styles.animatedFace,
            {
                zIndex: zFront,
                // opacity: this.state.opacityFront,
                transform: [{rotateY: rotateYFront}]
            }
        ]
        const backFaceStyle = [
            styles.animatedFace,
            {
                zIndex: zBack,
                // opacity: this.state.opacityBack,
                transform: [{rotateY: rotateYBack}]
            }
        ]

        return (
            <View style={styles.animatedContainer}>

                <Animated.View
                    useNativeDriver
                    style={backFaceStyle}>
                    {this.flippedCardView(true)}
                </Animated.View>

                <Animated.View
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
