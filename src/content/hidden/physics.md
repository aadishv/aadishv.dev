---
date: "2025-08-01"
title: "Notes from studying physics"
categories: ["note"]
description: ""
---

**Updated up to Chapter 6**

Things to understand:

- Algebra & trigonometry
- Vectors

## Fundamentals

These are pretty tricky to understand, mainly because the textbook uses a lot of terms which aren't well-defined.

### Core ideas

1. _Everything_ depends on how you define your boundaries between systems.
2. Force, acceleration, velocity, and displacement are all vectors.
3. Work is a change in energy. Net work is a change in kinetic energy.
4. Entropy is how “spread out” energy is.

### Definitions

- Mechanical energy is the combination of kinetic and potential energy.
- Conservative forces convert between kinetic and potential energy (they do not increase entropy).
- Nonconservative forces increase entropy (they convert between mechanical energy and unusable/thermal energy).

### Derivative ideas

1. An increase in entropy lessens the difference in energy between any two states, decreasing the amount of energy available to do work.
2. Gravity: when something falls onto the ground, the following happens. (This seems obviously but took me a long time to understand.)
   1. This thing has gravitational potential energy.
   2. Its GPE is converted to kinetic energy. It begins to accelerate.
   3. The ground begins to sag.
   4. This continues until an equilibrium is reached where the normal force contributed upwards by the elastic nature of the ground equals the gravitational force.
   5. At this point, no more work is done as no further displacement occurs.
3. In an <u>ideal system in which only conservative work is done,</u> mechanical energy is conserved (the energy available to do work remains the same, as described in derivative idea 1).
4. In a system that is not this ideal, mechanical energy decreases as work is done due to nonconservative forces.
5. When only work that affects potential energy is done (that is, an external force acts against a conservative force) and there is no change in kinetic energy, net work is zero, because work occurs internally to convert between the original form of energy to potential energy. This work cancels with the original work done by an external force.

## Equations

<table>
  <tr>
    <th>Law</th>
    <th>Equations</th>
    <th>Variables</th>
  </tr>
  <tr>
    <td>1D kinematics</td>
    <td>
        $$\begin{aligned}
        \Delta x &= v_0t + \frac 12 at^2 \\
        v_f^2 &= v_0^2 + 2a \cdot \Delta x
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>displacement $$\Delta x = x_f - x_0$$</li>
            <li>velocity $$v_0 \xrightarrow{t} v_f$$</li>
            <li>acceleration \(a\)</li>
            <li>elapsed time $$t = t_f - t_0$$</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Newton's laws (not including inertia)</td>
    <td>
        $$
        \begin{aligned}
        F &= ma \\
        F_a &= -F_b
        \end{aligned}
        $$
    </td>
    <td>
        Assume \(a\) and \(b\) are two systems, with one applying a force to the other.
        <ul>
            <li>magnitude of force \(F\)</li>
            <li>mass \(m\) & magnitude of acceleration \(a\)</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Friction between two objects (static & kinetic)</td>
    <td>
        $$
        \begin{aligned}
        f_s &\leq \mu_s N \\
        f_k &= \mu_k N \\
        \end{aligned}
        $$
        Note that, after the force pushing the objects exceeds \(f_s\), the objects will start to move and there is a constant force of \(f_k\) as they move.
    </td>
    <td>
        <ul>
            <li>\(\mu_s\) is the coefficient of static friction</li>
            <li>\(\mu_k\) is the coefficient of kinetic friction</li>
            <br>
            \(N\) is the normal force, the contact force exerted by a surface on an object perpendicular to that surface.<br> When the only force in this direction is gravity, \(N\) is the component of the gravitational force perpendicular to the surface.
        </ul>
    </td>
  </tr>
  <tr>
    <td>Drag (for larger objects) & Stokes' law (for smaller objects/denser fluids)</td>
    <td>
        $$
        \begin{aligned}
        F_D = \frac{1}{2} \rho\,C A v^2 \\
        F_D = 6\pi\eta rv
        \end{aligned}
        $$
    </td>
    <td>
        <ul>
            <li>\(\rho\) is the density of the fluid</li>
            <li>\(C\) is the drag coefficient</li>
            <li>\(A\) is the cross-sectional area of the object</li>
            <li>\(\eta\) is the viscosity of the fluid</li>
            <li>\(r\) is the radius of the object</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Elastic force</td>
    <td>
        Hooke's law: amount of deformation is proportional to applied force
        $$
        \begin{aligned}
        \Delta L = \frac 1C \frac FA L_0
        \end{aligned}
        $$
    </td>
    <td>
        <ul>
            <li>\(\Delta L\) is the amount of deformation</li>
            <li>\(A\) is the cross-sectional area of the object</li>
            <li>stress, \(\displaystyle \frac FA\)</li>
            <li>strain, \(\displaystyle \frac {\Delta L} L_0\)</li>
            <li>...so that \(\text{stress} = \text{strain} \times Y\)</li>
        </ul>
        <br>
       \(C\) is a constant depending on kind of force and material.
       Kinds of forces:
        <ul>
            <li>
            Tensile/compressive forces (perpendicular to the surface in both axes).
            <br>Tensile: \(\Delta L > 0\).<br>Compressive: \(\Delta L < 0\).
                <br>\(C = Y\), the Young's modulus.
            </li>
            <li>
                Shear forces (perpendicular to \(L_0\)). In this case \(\Delta L = \Delta x\), where \(\Delta x\) is perpendicular to \(L_0\).
                <br>\(C = S\), the shear modulus.
            </li>
            <li>
                Bulk forces (pushing inwards on all surfaces). In this case \(\Delta L = \Delta V\) and \(L_0 = V_0\).
                <br> \(\Delta V < 0\). \(C = B\), the bulk modulus.
                    \(B\) is often written with a negative sign to indicate that an increase in force results in a decrease in volume. <br>
                For bulk force calculation,
            </li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Angular motion</td>
    <td>
        $$\begin{aligned}
        \omega &= \frac{\Delta \theta}{\Delta t} \\
        v &= r\omega \\
        a_c &= \frac{v^2}r = r\omega^2 \\
        F_c &= ma_c = mr\omega^2= m\frac{v^2}r
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>\(\theta\) current angle</li>
            <li>\(\omega\) angular velocity</li>
            <li>centripetal acceleration \(a_c\) and centripetal force \(F_c\) point towards the center of rotation and are perpendicular to \(v\)</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Newton's universal law of gravitation</td>
    <td>
        $$\begin{aligned}
        F = G\frac{m_1m_2}{r^2}
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>\(r\) distance between masses \(m_1\) and \(m_2\)</li>
            <li>gravitational constant \(G = 6.674 \times 10^{-11} \dfrac{\text{Nm}^2}{\text{kg}^2}\)</li>
        </ul>
    </td>
  </tr>
</table>
