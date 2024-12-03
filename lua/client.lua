--------------------------
-- Turtle socket client --
-- by Hri7566           --
--------------------------

local ws, err = http.websocket("ws://home.hri7566.info:3000");

if err ~= nil then
    print(err)
end

local function send(msgs)
    local data = textutils.serializeJSON(msgs)
    ws.send(data)
end

local function handleMessage(data)
    local msgs = textutils.unserializeJSON(data)

    for i, msg in pairs(msgs) do
        if msg.m == "hi" then
            send({{m = "hi"}})
        end

        if msg.m == "refuel" then
            turtle.refuel()
        end

        if msg.m == "lua" then
            local code = loadstring(msg.code)
            code()
        end

        if msg.m == "turn" then
            local dir = msg.direction

            if dir == "left" then
                turtle.turnLeft()
            elseif dir == "right" then
                turtle.turnRight()
            end
        end

        if msg.m == "forward" then
            turtle.forward()
        end

        if msg.m == "back" then
            turtle.back()
        end

        if msg.m == "getfuel" then
            local fuel = turtle.getFuelLevel()
            send({{m = "setfuel", fuel = fuel}})
        end

        if msg.m == "dig" then
            local direction = msg.direction
            
            if direction == "up" then
                turtle.digUp()
            elseif direction == "down" then
                turtle.digDown()
            else
                turtle.dig()
            end
        end

        if msg.m == "setname" then
            local name = msg.name
            os.setComputerLabel(name)
        end
    end
end

local function listen()
    while true do
        local text = ws.receive()
        pcall(function ()
            handleMessage(text)
        end)
    end
end

parallel.waitForAny(listen)
