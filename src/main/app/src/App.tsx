import { Box, Button, ChakraProvider, CloseButton, Container, Flex, Heading, Input, Text, Textarea } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import theme from "./theme";

const API_URL = "/api";
const SESSION_ID_LENGTH = 6;

export const App = () => {
    const [code, setCode] = useState("");
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const savedCode = sessionStorage.getItem("clip-session-id");

        if (savedCode !== null && savedCode !== undefined) {
            setCode(savedCode);
            fetchSession(savedCode);
        }
    }, []);

    useEffect(() => {
        if (code) {
            const id = setInterval(() => fetchSession(code, false), 1000);
            return () => clearInterval(id);
        }
    }, [code]);

    const fetchSession = async (code: string, shouldAlert: boolean = true) => {
        try {
            const response = await fetch(`${API_URL}/session/${code}`);

            if (response.ok) {
                const data = await response.json();

                sessionStorage.setItem("clip-session-id", code);
                sessionStorage.setItem("clip-items", JSON.stringify(data));

                setItems(data);
            } else {
                if (response.status === 404) {
                    onChange();
                    return toast("The session has been deleted", { type: "error" });
                }
            }
        } catch (e: any) {
            if (shouldAlert) {
                toast("Failed to fetch items", { type: "error" });
            }
        }
    }

    const onJoin = (code: string) => {
        setCode(code);
        fetchSession(code);
    }

    const onDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/session/${code}`, { method: "DELETE" });

            if (response.ok) {
                sessionStorage.clear();
                setCode("");
                setItems([]);
            }
        } catch (e: any) {
            toast("Failed to delete session", { type: "error" });
        }
    }

    const onChange = () => {
        setCode("");
        sessionStorage.clear();
    }

    const onAddItem = (item: any) => {
        setItems([item, ...items]);
        sessionStorage.setItem("clip-items", JSON.stringify([item, ...items]));
    }

    const onDeleteItem = (itemId: string) => {
        const newItems = items.filter(item => {
            if (item.id !== itemId) {
                return true;
            }
            return false;
        });
        setItems(newItems);
        sessionStorage.setItem("clip-items", JSON.stringify(newItems));
    }

    return (
        <ChakraProvider theme={theme}>
            <Box paddingX="2">
                <Flex
                    height="250px"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    paddingTop="100px"
                >
                    <Heading
                        fontSize="60px"
                        fontWeight="800"
                        marginBottom="10px"
                    >
                        Clip
                    </Heading>

                    <Text
                        color="rgb(107,114,128)"
                        fontSize="20px"
                    >
                        Effortlessly copy & paste between devices
                    </Text>
                </Flex>

                <Flex
                    marginBottom="8"
                    justifyContent="center"
                >
                    {!code ? <CreateSection onJoin={onJoin} /> : <InfoSection code={code} onChange={onChange} onDelete={onDelete} />}
                </Flex>

                <Container maxWidth={{ base: "100%", md: "50%" }}>
                    {code && <MainSection code={code} items={items} onAddItem={onAddItem} onDeleteItem={onDeleteItem} />}
                </Container>
                <Container maxWidth={{ base: "100%", md: "70%" }}>
                    {!code && <HowItWorks />}
                </Container>
            </Box>

            <ToastContainer />
        </ChakraProvider>
    )
}

const HowItWorks = () => {
    return (
        <Box textAlign="center">
            <Text fontSize="18" fontWeight="bold">How It Works</Text>
            <Text color="rgb(107,114,128)" marginBottom="4">
                Open up this page on two devices (or two tabs if you're testing!). On one page, click <strong>Create Session</strong>. On another page, enter 
                the <strong>Session ID</strong> and click <strong>Join</strong>. Type in the box, hit enter, and watch it appear on the other page!
            </Text>
            <Text color="rgb(107,114,128)" marginBottom="4">
                You can delete invidual items or delete the entire session itself. Please note that clicking <strong>Change session</strong> will not delete the session,
                it will remove you from it.
            </Text>
            <Text color="rgb(107,114,128)" fontWeight="bold">
                NOTE: Sessions expire automatically after 1 hour of inactivity
            </Text>
        </Box>
    )
}

const MainSection = ({ code, items, onAddItem, onDeleteItem }: any) => {
    const [text, setText] = useState("");

    const addText = async () => {
        try {
            const response = await fetch(`${API_URL}/session/${code}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                onAddItem(data);
            }
        } catch (e: any) {
            toast("Failed to add item", { type: "error" });
        }
    }

    const deleteItem = async (itemId: string) => {
        try {
            const response = await fetch(`${API_URL}/session/${code}/items/${itemId}`, { method: "DELETE" });

            if (response.ok) {
                onDeleteItem(itemId);
            }
        } catch (e: any) {
            toast("Failed to delete item", { type: "error" });
        }
    }

    return (
        <Box>
            <Textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                marginBottom="2"
                placeholder="Enter text here..."
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        addText();
                    }
                }}
            />
            <Button
                colorScheme="facebook"
                height="8"
                isDisabled={text.length === 0}
                onClick={addText}
            >
                Add Text
            </Button>

            <Flex
                flexDirection="column"
                gap="4"
                marginTop="5"
                marginBottom="20"
            >
                {items.map((item: any) => (
                    <Flex
                        key={item.id}
                        bgColor="white"
                        paddingX="4"
                        paddingY="2"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Text>{item.text}</Text>
                            <Text color="muted" fontSize="14">{item.creationDate}</Text>
                        </Box>
                        <CloseButton onClick={() => deleteItem(item.id)} />
                    </Flex>
                ))}
            </Flex>
        </Box>
    )
}

const CreateSection = ({ onJoin }: any) => {
    const [code, setCode] = useState("");

    const createSession = async () => {
        try {
            const response = await fetch(`${API_URL}/session/new`, { method: "POST" });

            if (response.ok) {
                const data = await response.json();

                sessionStorage.setItem("clip-session-id", data.code);
                sessionStorage.setItem("clip-items", "[]");

                onJoin(data.code);
            }
        } catch (e: any) {
            toast("Failed to create session", { type: "error" });
        }
    }

    const joinSession = async () => {
        try {
            if (code.length !== SESSION_ID_LENGTH) {
                return toast("Invalid Session ID", { type: "error" });
            }
            const response = await fetch(`${API_URL}/session/${code}`);

            if (response.ok) {
                const data = await response.json();

                sessionStorage.setItem("clip-session-id", code);
                sessionStorage.setItem("clip-items", JSON.stringify(data));

                onJoin(code);
            } else {
                if (response.status === 404) {
                    return toast("Session not found", { type: "error" });
                }
            }
        } catch (e: any) {
            toast("Failed to join session", { type: "error" });
        }
    }

    return (
        <Flex
            bgColor="rgb(31 41 55)"
            justifyContent="space-between"
            color="white"
            height="fit-content"
            gap="20px"
            boxShadow="0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1)"
            borderRadius="10px"
            padding="30px"
            width={{ base: "100%", md: "60%" }}
        >
            <Flex
                width="100%"
                justifyContent="space-evenly"
                flexDirection={{ base: "column", md: "row" }}
                textAlign="center"
            >
                <Box
                    width="100%"
                    borderRight={{ base: "none", md: "1px solid #e3e3e3" }}
                    borderBottom={{ base: "1px solid #e3e3e3", md: "none" }}
                    paddingBottom={{ base: 6, md: "0" }}
                >
                    <Heading size="xs">New Session</Heading>
                    <Button
                        bgColor="white"
                        color="black"
                        height="8"
                        marginTop="4"
                        onClick={createSession}
                    >
                        Create
                    </Button>
                </Box>

                <Box width="100%" paddingTop={{ base: 6, md: "0" }}>
                    <Heading size="xs">Join Session</Heading>

                    <Flex
                        marginTop="4"
                        gap="2"
                        justifyContent="center"
                    >
                        <Input
                            height="8"
                            color="black"
                            maxLength={6}
                            maxWidth="60%"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    joinSession();
                                }
                            }}
                        />
                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            isDisabled={code.length < SESSION_ID_LENGTH}
                            onClick={joinSession}
                        >
                            Join
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    )
}

const InfoSection = ({ code, onChange, onDelete }: any) => {
    return (
        <Flex
            bgColor="rgb(31 41 55)"
            justifyContent="space-between"
            color="white"
            height="fit-content"
            gap="20px"
            boxShadow="0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1)"
            borderRadius="10px"
            padding="30px"
            width={{ base: "100%", md: "60%" }}
        >
            <Flex
                width="100%"
                justifyContent="space-evenly"
                textAlign="center"
                flexDirection={{ base: "column", md: "row" }}
            >
                <Box
                    width="100%"
                    paddingBottom={{ base: 2, md: "0" }}
                >
                    <Heading size="xs">Session ID</Heading>
                    <Text fontSize="26">{code}</Text>
                </Box>

                <Box width="100%" paddingTop={{ base: 2, md: "0" }}>
                    <Flex
                        marginTop="4"
                        gap="2"
                        justifyContent="center"
                    >
                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            onClick={onChange}
                        >
                            Change session
                        </Button>

                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            onClick={onDelete}
                        >
                            Delete session
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    )
}