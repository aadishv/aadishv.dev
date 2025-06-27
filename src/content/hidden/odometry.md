---
date: "2025-06-27"
title: "Simple odometry for VEX teams"
categories: ["blog"]
description: ""
---

<a href="https://gist.github.com/aadishv/fdc2958e8989c029da8cc0dbc7307244" class="text-xl">
  Final implementation
</a>

In this post, I'm going to detail a simple mathematical model for building up a minimal modern odometry. Keep in the mind the following:

* **This goes through a lot of the basic math.** If you have taken a precalculus course before, or know axis rotation math, you can skip many of the sections here. I assume a basic knowledge of trigonometry (soh-cah-toa) -- I don't use anything more advanced, like the dot product, without explaining. Implicitly, everything I take about is in terms of vectors, but I refer to them as "points" for simplicity.
* **This depends on a very specific hardware configuration.** It assumes you have two tracking wheels, mounted on the robot such that they are perpendicular to each other. One is facing the robot's forward direction, the other is facing the robot's sideways direction. You should also have an Inertial Movement Unit (IMU, aka "inertial sensor") mounted to measure orientation.

I will be stepping through the Rust implementation using vexide. This is inspired by that of [fibonacci61](https://github.com/fibonacci61) in [odomopedia](https://github.com/fibonacci61/odomopedia).

**Is this what all teams are using?**
Yes and no. First, we need to establish a landmark paper by team 5225, E-Bots Pilons. This paper, generally just referred to as "the Pilons paper", is as close as you can get to revolutionary for VEX.
> [Read it on the Purdue SigBots Wiki](https://wiki.purduesigbots.com/software/odometry).

This paper implements the *exact same algorithm* I describe here. There are two main differences.
* The Pilons paper uses arcs, a lot of arcs. There is conversion math between arcs and chords, chords and arcs, etc., which leads to a *lot* of trig functions. In the end, it uses arcs to account for wheel travel due to angular change. I also account this, but without arcs.
* It also assumes you have three tracking wheels (the third tracking wheel is compared to the first to find angular change). I use the setup with two tracking wheels and one inertial sensor.

Most teams use the Pilons' algorithm, so in that sense, yes, this is the same math being done. I just describe and implement it a little different.

<hr />

Let's get into it.

## Imports
vexide-specific. Don't worry too much about it.
```rs
#![no_std]

use core::{
    f64::consts::PI,
    ops::{Add, Deref, Mul},
};

use vexide::{devices::{smart::imu::InertialError, PortError}, float::Float, prelude::*};
```

## Basic structs
```rs
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Pose {
    pub position: Vec2,
    pub heading: f64,
}

pub struct TrackingWheel {
    rotation_sensor: RotationSensor,
    wheel_diameter: f64,
    gearing: f64,
    offset: f64,
}

pub struct Tracker {
    forward_tracking_wheel: TrackingWheel,
    sideways_tracking_wheel: TrackingWheel,
    imu: InertialSensor,

    prev_position: Vec2,
    prev_heading: f64,
    prev_forward_travel: f64,
    prev_sideways_travel: f64,
}
```

* `Vec2` is basically just a point.
* `Pose` is a point with a heading.
* `Tracker` contains the hardware (from vexide) required for an odometry system with two perpendicular tracking wheels and one inertial sensor.
* It also keeps track of previous positions to calculate deltas.


## Adding method and trait implementations to these structs

Feel free to skip this section, not anything super important.

```rs
impl Add for Vec2 {
    type Output = Self;

    fn add(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl Mul<f64> for Vec2 {
    type Output = Self;

    fn mul(self, rhs: f64) -> Self::Output {
        Self {
            x: self.x * rhs,
            y: self.y * rhs,
        }
    }
}

impl TrackingWheel {
    // returns travel in inches
    pub fn travel(&self) -> Result<f64, PortError> {
        let wheel_circumference = self.wheel_diameter * PI;

        Ok(self.rotation_sensor.position()?.as_revolutions() * wheel_circumference * self.gearing)
    }
}
```

## Vector rotation
```rs
impl Vec2 {
    pub fn rotated(&self, angle: f64) -> Self {
        let (sin, cos) = angle.sin_cos();

        Self {
            x: self.x * cos - self.y * sin,
            y: self.x * sin + self.y * cos,
        }
    }
}
```
> What the heck does this code do?!

That is also something I asked myself when first looking at this (and have since been asked by other people about as well). This math basically takes in a floating-point `angle` and rotates the point `angle` radians counterclockwise around the origin.

Fun fact: the bonus question on my precalculus final this year was to prove this!

Let's prove it. Feel free to skip this part if you don't really care about the math or already know it.

**Prerequisites**
* trigonometry (sine, cosine)
* knowledge of polar coordinates

A simple way to think about it is to the vector as a polar coordinate (r, θ). Then, we can just add `angle` to θ to get the rotated point.

Let's introduce the archnemesis of your ~~life~~ algebra class: the coordinate plane! And let's put our two points (original and rotated) on it:

![Both points on the coordinate plane](assets/odometry/1.png)

Note that the radius \(r\) of both points are the same, and their θ values differ by `angle`. Assuming you already know polar coordinates (you better!), we can write

$$\begin{aligned}
r &= \sqrt{x^2 + y^2} \\\\
\theta &= \arctan\left(\frac{y}{x}\right).
\end{aligned}$$

Now, let's try calculating \\((\text{new x}, \text{new y})\\) based on this.

$$\begin{aligned}
\text{new x} &= r \cos(\theta + \text{angle}) \\\\
\text{new y} &= r \sin(\arctan\left(\frac{y}{x}\right) + \text{angle}) \\\\\\,\\\\
\text{new x} &= \sqrt{x^2 + y^2} \cos(\arctan\left(\frac{y}{x}\right) + \text{angle}) \\\\
\text{new y} &= \sqrt{x^2 + y^2} \sin(\arctan\left(\frac{y}{x}\right) + \text{angle}).
\end{aligned}$$

We can now apply the sum formulas for cosine and sine, and then the identities for taking the cosine or sine of the arctangent.

$$\begin{aligned}
\text{new x} &= \sqrt{x^2 + y^2} \left(\cos\left(\arctan\left(\frac{y}{x}\right)\right) \cos\left(\text{angle}\right) - \sin\left(\arctan\left(\frac{y}{x}\right)\right) \sin\left(\text{angle}\right)\right) \\\\
\text{new y} &= \sqrt{x^2 + y^2} \left(\sin\left(\arctan\left(\frac{y}{x}\right)\right) \cos\left(\text{angle}\right) + \cos\left(\arctan\left(\frac{y}{x}\right)\right) \sin\left(\text{angle}\right)\right) \\\\
\cos\left(\arctan\left(\frac{y}{x}\right)\right) &= \frac{1}{\sqrt{1 + \left(\frac{y}{x}\right)^2}} = \frac{x}{\sqrt{x^2 + y^2}}. \\\\
\sin\left(\arctan\left(\frac{y}{x}\right)\right) &= \frac{\frac{y}{x}}{\sqrt{1 + \left(\frac{y}{x}\right)^2}} = \frac{y}{\sqrt{x^2 + y^2}}\\\\\\,\\\\
\text{new x} &= \sqrt{x^2 + y^2} \left(\frac{x}{\sqrt{x^2 + y^2}} \cos\left(\text{angle}\right) - \frac{y}{\sqrt{x^2 + y^2}} \sin\left(\text{angle}\right)\right) \\\\
\text{new y} &= \sqrt{x^2 + y^2} \left(
\frac{y}{\sqrt{x^2 + y^2}} \cos\left(\text{angle}\right) + \frac{x}{\sqrt{x^2 + y^2}} \sin\left(\text{angle}\right)
\right) \\\\\\,\\\\
\text{new x} &= x\cos\left(\text{angle}\right) - y\sin\left(\text{angle}\right) \\\\
\text{new y} &= y\cos\left(\text{angle}\right) + x\sin\left(\text{angle}\right).
\end{aligned}$$
Ta-da! That is the exact same math we had in the function!
```rs
x: self.x * cos - self.y * sin,
y: self.x * sin + self.y * cos
```
Now we can *finally* move on...

## More obscure tracker functions

Now, if you are planning to use this code or implement it, this part is important. The VEX IMU returns headings clockwise, but for the rest of this article, we're assuming that we are working in a Cartesian coordinate system. This means that the angle is measured counterclockwise from the positive x-axis. This means we need some extra code to handle the conversion from clockwise to counterclockwise (it is effectively just a negative sign). We also initialize the IMU to the correct heading (basically telling it "Yo, we are currently facing this direction, tell me if we turn!").
```rs
impl Tracker {
    pub fn new(forward: TrackingWheel, sideways: TrackingWheel, mut imu: InertialSensor, initial_pose: Pose) -> Result<Tracker, InertialError> {
        imu.set_heading(-initial_pose.heading)?; // clockwise...
        let prev_forward_travel = forward.travel()?;
        let prev_sideways_travel = sideways.travel()?;
        Ok(Tracker {
            forward_tracking_wheel: forward,
            sideways_tracking_wheel: sideways,
            imu: imu,
            prev_position: initial_pose.position,
            prev_forward_travel: prev_forward_travel,
            prev_sideways_travel: prev_sideways_travel,
            prev_heading: initial_pose.heading,
        })
    }
    pub fn get_heading(&self) -> f64 {
        return -1.0 * self.imu.heading().expect("couldn't get IMU heading");
    }
}
```
There is some extra code to handle setting the IMU heading, but is otherwise pretty straightforward.

## The tracking itself

The actual odometry math is almost deceptively simple once you get to this point. It all occurs in this function:

```rs
impl Tracker {
    pub fn track(&mut self) -> Pose {
        // ...
    }
}
```

Let's break this down.

### Getting travel & heading
```rs
let forward_travel = self
    .forward_tracking_wheel
    .travel()
    .expect("couldn't get forward tracking wheel travel");
let sideways_travel = self
    .sideways_tracking_wheel
    .travel()
    .expect("couldn't get sideways tracking wheel travel");
let heading = self.get_heading();

let delta_forward_travel = forward_travel - self.prev_forward_travel;
let delta_sideways_travel = sideways_travel - self.prev_sideways_travel;

// all in Cartesian
let delta_heading = heading - self.prev_heading;
let avg_heading = self.prev_heading + delta_heading / 2.0;
```
Pretty straightforward: you get the sensor readings. Note that all of these actually call a wrapper:

* The `TrackingWheel.travel()` function gets the actual wheel travel under the hood, but multiplies by the wheel radius to convert to inches.
* The `Tracker.get_heading()` function gets the real wheel travel under the hood, but handles the Cartesian conversions as I previously mentioned.

We then calculate the delta (difference since last update) as well as the average heading, which we'll use later.

### Understanding the general idea

Let's imagine we have our robot moving. Look at the path the tracking wheels trace out. Note that length of this path is the same as the delta travel for either wheel. (I only depict the path for the forwards tracker because it's easier to visualize.)

![Depiction of tracking wheel path over robot motion](assets/odometry/2.png)

Notice that the actual (blue) path it takes is different than the straight-line (red) path. This is because, well, the robot is turning, causing the tracking wheel to move in a curving motion. All odometry implementations model this motion as an arc (which is accurate for small time steps). Obviously, however, the line is much easier to work with.

Let's look at a simplified model of turning (with no other translation) to try to see how we can subtract that wheel travel.

![Depiction of tracking wheel path over robot turn](assets/odometry/3.png)

Ah-ah! That's an arc -- particularly
