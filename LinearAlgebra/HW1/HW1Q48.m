disp("___Question 48___")

D = [0.0130 0.0050 0.0020 0.0010; 0.0050 0.0100 0.0040 0.0020;
0.0020 0.0040 0.0100 0.0050; 0.0010 0.0020 0.0050 0.0130]

F = [0.07; 0.12; 0.16; 0.12]

ans = rref([D,F]);

disp("Forces at the four points are:\n")
ans(:,5)