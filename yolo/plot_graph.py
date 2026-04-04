import matplotlib.pyplot as plt
import csv

x = []
y = []

with open('../data/realtime_data.csv','r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        x.append(int(row['Step']))
        y.append(int(row['Adaptive']))

plt.plot(x,y,marker='o')
plt.xlabel("Time Step")
plt.ylabel("Waiting Time")
plt.title("Traffic Optimization")
plt.grid()

plt.savefig("../data/traffic_comparison.png")
plt.show()