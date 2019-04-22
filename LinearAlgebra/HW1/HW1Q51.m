disp("___Question 51___")

H = sym(hilb(12));

disp("Part A:\n")
HtwelveInverse = inv(H)

disp("Part B:\n")
HHinv = H * HtwelveInverse

disp("The result of H*H^-1 is the identity matrix")
