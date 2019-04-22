disp("----Question 44----\n")
clear
format rat

A = [0.5 0.5 0.5 0.5; 0.5 0.5 -0.5 -0.5; 0.5 -0.5 0.5 -0.5; 0.5 -0.5 -0.5 0.5];
[m, n] = size(A)
A_length = zeros(m,n);

for i = 1:n
  A_length(i) = sqrt(A(:,i)' * A(:,i));
end
disp("Length of columns of A:\n")
A_length

disp("a1 dot a2:")
A(:,1)' * A(:,2)
disp("a1 dot a3:")
A(:,1)' * A(:,3)
disp("a1 dot a4:")
A(:,1)' * A(:,2)
disp("a2 dot a3:")
A(:,2)' * A(:,3)
disp("a2 dot a4:")
A(:,2)' * A(:,4)
disp("a1 dot a2:")
A(:,3)' * A(:,4)

for k = 1:2
u = rand(4,1)
v = rand(4,1)

u_length = sqrt(u' * u)
v_length = sqrt(v' * v)
Au = A * u;
Au_length = sqrt(Au' * Au)
Av = A * v;
Av_length = sqrt(Av' * Av)

%part d
disp("Part D: ")
disp("cosine of the angle between u and v = ")
acos((u' * v) / (u_length*v_length))
disp("cosine of the angle between Au and Av")
acos((Au' * Av) / (Av_length * Au_length))

if(k == 1)
  disp("Repeating for another random u,v\n\n")
end
end

%todo: part e
