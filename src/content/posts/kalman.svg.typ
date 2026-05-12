#metadata((
  title: "Kalman filters",
  date: "2026-05-11",
  description: "An intuitive derivation of the Kalman filter and Extended Kalman filter.",
))<frontmatter>
#show link: it => underline(it)
#set page(width: 450pt, height: auto, margin: 0pt)

For the final project of the #link("https://onlinehighschool.stanford.edu/courses/2026/school-year/um150")[math course] I am taking this school year, I wrote a brief explanatory paper aiming to provide some intuition for the standard equations used for the Kalman filter and Extended Kalman filter. I have a track record of writing #link("/mcl")[about] #link("/mcl-2")[control] #link("/move2point")[theory], I thought I would publish it here in case it helps anyone.

First, I give the formula for the standard Kalman filter formula. Then, I derive the Extended Kalman filter formula.

(Note: my notation is quite sloppy, particularly, I don't distinguish between the _a priori_ and _a posteriori_ state variables, which makes some equations confusing to read.)

== Standard Kalman filter

The goal of any filter is to, given a time series of measurements from a noisy sensor (e.g., that has some predictable noise added to an otherwise accurate measurement), predict the state of a linear system. In this case, the linear system must be able to be expressed using a state transition matrix and a process noise matrix (which represents inherent noise in the system, as opposed to actual inaccuracies in the sensor). For example, a robot could be trying to estimate its position using a noisy visual odometry sensor (i.e., that uses a floor-facing camera to track position, like computer mice do). It assumes a few key properties:

- The system can be modeled using a state $n$-vector $x$ with sensors producing $m$-dimensional vector measurements $z$
- The system can be modeled discretely from time step $t-1$ to step $t$ using a state transition matrix $F$ and a $n times n$ process covariance matrix $Q$:
    - $x_t = F x_(t-1) + cal(N)(0, Q)$
    - (where $cal(N)(0, Q)$ represents a random sample from a multivariate Gaussian centered at $0$ with covariance $Q$ (covariance is the multidimensional analog of variance)
- Measurements can be modeled based on an $m times n$ observation matrix $H$ and a $m times m$ measurement covariance matrix $R$:
    - $z_t = H x_t + cal(N)(0, R)$

The Kalman filter then tracks two variables; its predicted state $x_t$, and the estimated uncertainty in that state, reprsented as a covariance matrix $P$. Together, these form a Gaussian distribution over the state space which tracks both the mean (predicted state) and the variance (covariance matrix) of the system.

The actual Kalman filter then consists of two steps to update the variables.

*Predict step* In this step, we update the model based on our priors (we don't yet use the latest sensor measurements). This has two parts; we update the predicted state using the state transition matrix, then update the uncertainty covariance matrix using the state transition and process noise matrices.
$
    x_t = F x_(t-1).
$
This is the exact application of the state transition matrix we discussed above.
$
    P_t = F P_(t-1) F^T + Q
$
Doing $F P F^T$ is the standard way to apply a transformation to a covariance matrix; it will be heavily used in the update step as well. We also directly add the process noise covariance to account for drift in the system since the last time step (not to be confused with drift in the measurements, which we account for in the update step).

*Update step* In this step, we use the latest sensor measurements to update the predicted state and covariance matrix. First, we compute the Kalman gain $K$. The Kalman gain matrix is essentially a measure of how much "trust" we have in the sensor measurements compared to our current state. If the Kalman gain is higher, then we correct our model to match the sensor measurements more.

Constructing the Kalman gain is a multistep process that importantly does not involve the measurement. First, we apply the observation matrix to the uncertainty and add the measurement noise covariance; this quantity, $H P_t H^T + R$, represents the covariance of the sensor measurements (due in part to the sensor noise and in part to the uncertainty in our model). Taking the inverse of the covariance results in the "precision" matrix, representing how accurate we believe each component of the sensor prediction is at any given time.

Next, we multiply the precision matrix $(H P_t H^T + R)^(-1)$ by the observation matrix $H$ to bring the precision matrix back into state space (it was previously in sensor/observation space). Finally, we multiply by the state covariance $P_t$ (again) to determine how the precision in measurements should be weighted. This results in the standard Kalman gain matrix $
    K = P_t H^T (H P_t H^T + R)^(-1).
$
In summary, the Kalman gain matrix is computed by
- finding the state uncertainty in sensor space
- finding the measurement precision in sensor space
- finding the measurement precision in state space
- weighting by the state covariance to determine how the precision in measurements should be weighted

The rest of the update step is simply applying the Kalman gain. We first multiply the innovation -- $z_t - H x_t$, the error between the measurement and the predicted measurement from our current model -- by the Kalman gain to add to the state estimate:
$
    x_t = x_t + K (z_t - H x_t).
$
To update our state uncertainty matrix, we again project the Kalman gain fully into state space using the observation matrix, producing a matrix representing how much of the state is correctable by the measurement. By subtracting from the identity matrix, we then produce a matrix representing which parts of the state were _not_ corrected by the measurement, which we multiply the previous state covariance matrix by to get the updated uncertainty:
$
    P_t = (I - K H) P_t.
$
At the end of the update step, we have successfully updated our model to correct the state estimate and uncertainty matrix to account for the measurement.

== Derivation of Extended Kalman filter

The vast majority of control theory applications are not a linear model. As a example that actually shows up regularly in VEX robots, imagine a square robot inside a 2D square field with four distance sensors on each side trying to localize against its $x$ and $y$ position. If the robot doesn't turn, the sensors simply report the distance to the nearest wall. The distances to each wall have a clear linear relation to the $x$ and $y$ coordinates, so we can model this as a linear system.
However, if we start to account for turns made by the robot, the problem quickly devolves; if we track $theta$, the state space becomes nonlinear, as raycasting is needed to predict distance sensor readings. The Extended Kalman filter is the most feasible approach, as it allows Kalman filters to be used for nonlinear systems (which all systems but the most contrived examples are).

The Extended Kalman filter uses two differentiable functions to replace the state transition and observation matrices:

$g(u_t, x_(t-1))$ represents the state transition for a previous state $x_(t-1)$ and a control $u_t$. Controls are factors influencing the state that _we_ can control and can thus use to update our priors about the state in the predict step; continuing the above example, the control for the robot may be the voltages sent to the drivetrain motors.

$h(x_t)$ represents the observation or sensor reading for a state $x_t$, replacing the observation matrix. Continuning the above example, $h(x_t)$ would, given a predicted pose ($x"/"y"/"theta$) of the robot, simulate the distance sensors and return the predicted distance sensor readings.

We can then rewrite our previous definitions of the state transition and observation calculation as follows:
$
    x_t &=> g(u_t, x_(t-1)) + cal(N)(0, Q) \
    z_t &=> h(x_t) + cal(N)(0, R)
$

The Extended Kalman filter takes advantage of the linear approximation of $g$ and $h$ (often referred to in the literature as the first-order Taylor expansion). Taylor expansions in multiple dimensions are very similar to the one-dimensional Taylor series covered in single-variable calculus. The Taylor expansion for a vector-valued vector-input function $f(x)$ is given by:
$
    f(x) &= f(x_0) + (Dif f)(x_0) times (x - x_0) + 1/2 (x - x_0)^T ("H" f)(x_0) times (x - x_0) + ....
$
(It gets quite ugly for the third term onwards.) Of course, for the Extended Kalman filter, we only need the first two terms, the multivariate linear approximation, which uses its Jacobian/derivative matrix (the equivalent of slope in multivariate calculus).

The Extended Kalman filter is then a simple modification over the standard Kalman filter. The changes made are as follows:
1. In the predict step, instead of using a linear state transition model ($x_t = F x_(t-1)$), we use the nonlinear state transition function $g$: $
    x_t &= g(u_t, x_(t-1)).
$
2. In the update step when computing the innovation, instead of using the observation matrix $H$, we use the nonlinear observation function $h$: $
    x_t = x_t + K (z_t - h(x_t)).
$
3. In general, throughout the filter, instead of using the observation matrix $H$ to propagate covariances, we use the observation function's Jacobian $(Dif h)(x_t)$, and instead of using the state transition matrix $F$, we use the state transition function's Jacobian $(Dif g)(u_t, x_(t-1))$.

To summarize, to convert a Kalman filter to an Extended Kalman filter, we replace
- uses of the state transition/observation matrices applied to vectors (to update the timestep or to move between state- and sensor-space) $=>$ use the nonlinear functions $g$ and $h$
- uses of the state transition/observation matrices applied to matrices (to propagate covariances) $=>$ use the Jacobians $(Dif g)(u_t, x_(t-1))$ and $(Dif h)(x_t)$.

Both standard and extended Kalman filters are found throughout robotics and other applications.

== Sources

Thrun, S., Burgard, W., & Fox, D. (2005). _Probabilistic Robotics._ The MIT Press.