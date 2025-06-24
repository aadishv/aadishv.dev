---
date: "2025-08-01"
title: "Notes from studying physics"
categories: ["note"]
description: ""
---

**Updated up to Chapter 5**

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
            <li>\(f_s\) is the coefficient of static friction</li>
            <li>\(f_k\) is the coefficient of kinetic friction</li>
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
        \Delta L = \frac 1Y \frac FA L_0
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
       \(Y\) is the Young's modulus, a constant depending on kind of force and material.
       For change in volume, replace \(\Delta L\) with \(\Delta V\) and \(L_0\) with \(V_0\). In this case, \(\dfrac FA\) is the force per unit area on all surfaces.
       Kinds of forces:
        <ul>
            <li>
            Tensile forces (perpendicular to the surface in both axes),
            \(\Delta L > 0\)
            <br>
            \(Y = )
            </li>
            <li>Compressive forces (perpendicular to the surface in both axes),
                \(\Delta L < 0\)</li>
        </ul>
    </td>
  </tr>
</table>
