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
        position: 'absolute',
        top: 0,
        left: 0,
        flex: 1,
        // width: screen.width,
        // height: screen.height - screen.navh
    },
    animatedContainer: {
        // top: 0,
        // left: 0,
        width: screen.width,
        height: screen.height - screen.navh
    }
};

class FlipCard extends React.PureComponent {
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

    componentDidMount() {
        // this.doFlip()
        window.flipper = this
    }

    componentWillUnmount() {
        this.state.animatedValue.removeAllListeners();
    }


    setFlip = (flipped) => {
        this.flipped = !this.flipped
        this.state.animatedValue.setValue(flipped ? 1 : 0)
    }

    doFlip = () => {

        this.flipped = !this.flipped

        Animated.timing(this.state.animatedValue, {
            duration: 500,
            toValue: this.flipped ? 1 : 0
        }).start(() => {
            // console.log('ANIMATION DONE');
            return true
        })

        /*
        Animated.spring(this.state.animatedValue, {
            toValue: this.flipped ? 1 : 0,   // Returns to the start
            velocity: this.props.velocity,  // Velocity makes it move
            tension: this.props.tension, // Slow
            friction: this.props.friction,  // Oscillate a lot
        }).start(() => {
            // console.log('ANIMATION DONE');
            return true
        })
        */
    };

    render() {
        console.log('RENDER');

        const rotateYFront = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '-90deg', '180deg']
        });

        const rotateYBack = this.state.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['180deg', '90deg', '0deg']
        });


        //using negative left position to prevent touches on the hidden face
        const leftFront = this.state.isFlipped.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -screen.vmax * 100]
        });

        const leftBack = this.state.isFlipped.interpolate({
            inputRange: [0, 1],
            outputRange: [-screen.vmax * 100, 0]
        });

        const frontFaceStyle = [
            styles.animatedFace, {
                left: leftFront,
                top: leftFront,
                transform: [{rotateY: rotateYFront}]
            }
        ]
        const backFaceStyle = [
            styles.animatedFace,
            {
                left: leftBack,
                top: leftBack,
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
