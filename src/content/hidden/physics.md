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

* _Everything_ depends on how you define your boundaries between systems.
* Energy is never created or destroyed.
  * The transfer of energy between systems by forces is work.
  * Internal work is also done within systems to transform energy between forms.
* Heat is the transfer of thermal energy between systems due to temperature difference.
* Because work is defined in terms of force, net work is the change in kinetic energy.

### Derivative ideas

1. Work done to transform energy into potential energy cancels with the corresponding original transfer of energy into the system. (If kinetic energy is affected, that does contribute to net work.)
2. Nonconservative forces do work to convert useful energy into thermal energy. This thermal energy is dissipated into an unusable form through heat.

## Equations

<table>
  <tr>
    <th>Law</th>
    <th>Equations</th>
    <th>Variables</th>
  </tr>
  <tr>
  <th colspan="3">Chapter 2</th>
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
  <th colspan="3">Chapter 4</th>
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
  <th colspan="3">Chapter 5</th>
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
  <th colspan="3">Chapter 6</th>
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
  <th colspan="3">Chapter 7</th>
  <tr>
    <td>Work</td>
    <td>
        $$\begin{aligned}
        W &= fd &&&(1) \\
        W &= fd\cos\theta &&&(2) \\
        W_{net} &= \Delta KE &&& (3) \\
        KE + PE &= \text{constant} &&& (4)
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>\(d\) distance over which force was applied</li>
            <li>\((1)\) for work causing acceleration in same direction as force</li>
            <li>\((2)\) for work causing acceleration in different direction to force (\(\theta\) is the angle between force and displacement)</li>
            <li>\((3)\) as noted in the fundamental ideas</li>
            <li>\((4)\) assuming no nonconservative forces act</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Energy</td>
    <td>
        $$\begin{aligned}
        KE &= \frac{1}{2}mv^2 \\
        \Delta PE_g &= mgh \\
        \Delta PE_s &= \frac{1}{2}kx^2 \\
        KE_i + PE_i + OE_i + W_{nc} &= KE_f + PE_f + OE_f + W_{nc} &&& (5)
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>\(h\) height change</li>
            <li>\(x\) displacement from equilibrium</li>
            <li>\(k\) spring constant (depends on spring)</li>
            <li>\(x\) displacement of spring from equilibrium</li>
            <li>\((5)\) - general form for the law of conservation of energy, taking into account loss of usable energy from heat.
                <ul>
                    <li>\(OE\) is any other form of energy.</li>
                    <li>\(W_{nc}\) is work done by nonconservative forces.</li>
                </ul>
            </li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>Efficiency & power</td>
    <td>
        $$\begin{aligned}
        Eff &= \frac{W_{out}}{E_{in}} &&& (6) \\
        P &= \frac{W}{\Delta t}
        \end{aligned}$$
    </td>
    <td>
        <ul>
            <li>
                \((6)\) - efficiency of work. \(W_{out}\) is useful energy produced; \(E_{in}\) is total energy input.
            </li>
        </ul>
    </td>
  </tr>
</table>
