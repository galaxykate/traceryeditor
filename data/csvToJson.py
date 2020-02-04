import random
import json
import csv
import sys

csv.field_size_limit(sys.maxsize)

with open(sys.argv[1] + ".csv") as csv_file:
	reader = csv.reader(csv_file, delimiter=',', skipinitialspace=True,quotechar = '"',doublequote = True,escapechar='\\')
	data = []
	count = 0
	for line in reader:
		if 	count % 1 == 0:
			
			data.append(line)
			if len(line) >= 3:
				line[4] = json.loads(line[4])
				keys = [*line[4]] 

				print(f"{line[0]}:{keys}")
			else:
				print(f"short line ({len(line)}): " + str(line) )
		count+=1

print(f"{len(data)} {[line[0] for line in data]}")


with open(sys.argv[1] + ".json", "w") as write_file:
	json.dump(data, write_file, indent=4)

# with open("data/cmudict-abridged.dict", "r") as f: 
# 	lines = f.readlines()
# 	print(len(lines))
# 	def processLine(line):
# 		word,pron = line.strip().split(" ", 1)
# 		return (word,pron)

# 	data = [processLine(line) for line in lines]

# with open("data/cmudict-abridged.json", "w") as write_file:
#     json.dump(data, write_file)