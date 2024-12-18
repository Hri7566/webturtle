--------------------------
-- Turtle socket client --
-- by Hri7566           --
--------------------------
---
local address = "ws://home.hri7566.info:3000"
local ws, err = http.websocket(address)

if err ~= nil then
    print(err)
end

local function send(msgs)
    local data = textutils.serializeJSON(msgs)
    ws.send(data)
end

local function handleMessage(data)
    print(data)
    local msgs = textutils.unserializeJSON(data)

    for i, msg in pairs(msgs) do
        if msg.m == "hi" then
            send({ { m = "hi" } })
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

            send({ { m = "finish_turn" } })
        end

        if msg.m == "forward" then
            turtle.forward()

            send({ { m = "finish_forward" } })
        end

        if msg.m == "back" then
            turtle.back()

            send({ { m = "finish_back" } })
        end

        if msg.m == "up" then
            turtle.up()

            send({ { m = "finish_up" } })
        end

        if msg.m == "down" then
            turtle.down()

            send({ { m = "finish_down" } })
        end

        if msg.m == "getfuel" then
            local fuel = turtle.getFuelLevel()
            send({ { m = "fuel", fuel = fuel } })
        end

        if msg.m == "refuel" then
            turtle.refuel()
            send({ { m = "finish_refuel" } })
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

            send({ { m = "finish_dig" } })
        end

        if msg.m == "setname" then
            local name = msg.name
            os.setComputerLabel(name)
            send({ { m = "finish_setname" } })
        end

        if msg.m == "getname" then
            local name = os.getComputerLabel()
            send({ { m = "name", name = name } })
        end

        if msg.m == "getinv" then
            local inv = {}

            for i = 1, 16 do
                turtle.getItemDetail(i)
            end

            send({ { m = "inv", inv = inv } })
        end

        if msg.m == "select" then
            turtle.select(msg.slot)
            send({ { m = "finish_select" } })
        end

        if msg.m == "inspect" then
            local has_block, data = turtle.inspect()

            send({ { m = "inspection", data = data, has_block = has_block } })
        end
    end
end

send({ { m = "iamaturtle" } })

local function listen()
    pcall(function()
        while true do
            local text = ws.receive()

            pcall(function()
                handleMessage(text)
            end)
        end
    end)

    ws, err = http.websocket(address)
end

parallel.waitForAny(listen)
