import React from "react"
import { useTranslation } from "react-i18next"

import ClickAwayListener from "@mui/material/ClickAwayListener"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import Collapse from "@mui/material/Collapse"

const LanguageList = (props) => {
	const { t, i18n } = useTranslation()

	const handleLanguageChange = (lan) => {
		i18n.changeLanguage(lan)
		props.setLanguageOpen(false)
	}

	const handleClickAway = (event) => {
		if (event.target.id !== "languageSelect") {
			props.setLanguageOpen(false)
		}
	}

	return (
		<ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway}>
			<Collapse sx={{ position: "absolute", zIndex: 100, right: 0 }} in={props.languageOpen}>
				<Paper sx={{ backgroundColor: "black" }} square>
					<List sx={{ p: 0 }}>
						<ListItem
							sx={{
								transition: "0.3s",
								"&&.Mui-selected": {
									backgroundColor: "#1f1f1f",
								},
								"&:hover": {
									backgroundColor: "#1f1f1f",
								},
							}}
							disablePadding
							selected={i18n.language === "lt"}
							onClick={() => handleLanguageChange("lt")}
						>
							<ListItemButton>
								<Typography sx={{ color: "#D42323" }} variant="h5">
									Lietuvių
								</Typography>
							</ListItemButton>
						</ListItem>
						<ListItem
							sx={{
								transition: "0.3s",
								"&&.Mui-selected": {
									backgroundColor: "#1f1f1f",
								},
								"&:hover": {
									backgroundColor: "#1f1f1f",
								},
							}}
							disablePadding
							selected={i18n.language === "en"}
							onClick={() => handleLanguageChange("en")}
						>
							<ListItemButton>
								<Typography sx={{ color: "#D42323" }} variant="h5">
									English
								</Typography>
							</ListItemButton>
						</ListItem>
					</List>
				</Paper>
			</Collapse>
		</ClickAwayListener>
	)
}

export default LanguageList