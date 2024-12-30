import { Box, Flex, Link, Text } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

export const GlitchNavbar = () => {
    return (
        <Box 
            bgColor="black" 
            padding={{ base: "10px 0", md: "0 32px" }}
            height={{ md: "54" }}
        >
            <Flex
                justifyContent="space-between"
                alignItems="center"
                flexDirection={{ base: "column", md: "row" }}
            >
                <Text
                    fontSize={{ base: "24px", md: "36px" }}
                    fontWeight="bold"
                    color="white"
                    textTransform="uppercase"
                    textShadow="0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00"
                    animation="glitch 725ms infinite"
                    className="glitch-nav-glitch"
                >
                    Glitch.je
                </Text>

                <Flex
                    flexWrap="wrap"
                    gap="1rem"
                    justifyContent={{ base: "center", md: "unset" }}
                    alignItems="center"
                >
                    <NavItem href="https://data.glitch.je" isActive={false}>
                        Open Data
                    </NavItem>
                    <NavItem href="https://qrcode.glitch.je" isActive={true}>
                        QR Code
                    </NavItem>
                    <NavItem href="https://clip.glitch.je" isActive={false}>
                        Clip
                    </NavItem>
                </Flex>
            </Flex>
        </Box>
    );
}

const NavItem = ({ href, isActive, children }: PropsWithChildren<{ href: string; isActive: boolean }>) => {
    return (
        <Link
            href={href}
            color="white"
            textDecoration="none"
            fontSize="1rem"
            paddingX="1rem"
            paddingY="0.5rem"
            borderRadius="36px"
            backgroundColor={isActive ? "rgba(75, 180, 225, 0.3)" : "transparent"}
            _hover={{
                backgroundColor: "rgba(75, 180, 255, 1)",
            }}
        >
            {children}
        </Link>
    );
}