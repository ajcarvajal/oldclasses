disp("----Question 48----\n")
clear 

syms t

u1=1;u2=cos(t);u3=(cos(t))^2; u4=(cos(t))^3; % Defining given set

% To find v1
v1=u1

% To find v2

v2=u2-(int(u2*v1,t,0,2*pi))/(int(v1*v1,t,0,2*pi))*v1

% To find v3

v3=u3-(int(u3*v1,t,0,2*pi))/(int(v1*v1,t,0,2*pi))*v1-(int(u3*v2,t,0,2*pi))/(int(v2*v2,t,0,2*pi))*v2

% To find v4

v4=u4-(int(u4*v1,t,0,2*pi))/(int(v1*v1,t,0,2*pi))*v1-(int(u4*v2,t,0,2*pi))/(int(v2*v2,t,0,2*pi))*v2-(int(u4*v3,t,0,2*pi))/(int(v3*v3,t,0,2*pi))*v3
