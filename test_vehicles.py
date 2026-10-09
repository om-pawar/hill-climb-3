import re

with open('g:/DESKTOP/trial/js/physics.js', 'r', encoding='utf-8') as f:
    pcode = f.read()

with open('g:/DESKTOP/trial/js/game.js', 'r', encoding='utf-8') as f:
    gcode = f.read()

vdefs = re.findall(r'(\w+):\s*\{\s*id:\s*[\'"](\w+)[\'"]', pcode)
print('Defined vehicles in physics.js:', [v[1] for v in vdefs])

# Check for id checks in drawVehicleBody
handled_ids = re.findall(r'id === [\'"](\w+)[\'"]', gcode)
print('Handled ids in game.js:', handled_ids)

for key, vid in vdefs:
    if vid != 'buggy' and vid not in handled_ids:
        print(f'WARNING: Vehicle {vid} not handled in drawVehicleBody!')
