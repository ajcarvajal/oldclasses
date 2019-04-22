disp("----Question 49----\n")

disp("part A \n")
t = linspace(0, 2*pi, 500);
fa = zeros(1, numel(t));

for m = 0:3
    fa = fa + 2/pi * sin((2*m + 1) * t) / (2*m + 1);
end

figure
plot(t, fa)
xlabel('t')
ylabel('f(t)')
grid on
grid minor
axis tight

disp("part B \n")
t = linspace(0, 2*pi, 500);
fb = zeros(1, numel(t));

for m = 0:4
    fb = fb + 2/pi * sin((2*m + 1) * t) / (2*m + 1);
end

figure
plot(t, fb)
xlabel('t')
ylabel('f(t)')
grid on
grid minor
axis tight

disp("part C \n")
tc = linspace(-2*pi, 2*pi, 500);
fc = zeros(1, numel(tc));

for m = 0:4
    fc = fc + 2/pi * sin((2*m + 1) * tc) / (2*m + 1);
end

figure
plot(tc, fc)
xlabel('t')
ylabel('f(t)')
grid on
grid minor
axis tight

figure
plot(t, fa, t, fb)
hold on
plot(tc, fc)
xlabel('t')
ylabel('f(t)')
legend('part(a)', 'part(b)', 'part(c)')
grid on
grid minor
axis tight