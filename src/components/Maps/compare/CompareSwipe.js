import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { map, view, maps } from "../../../utils/mapsArcgisItems"

import Swipe from "@arcgis/core/widgets/Swipe"
import MenuItem from "@mui/material/MenuItem"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Menu from "@mui/material/Menu"
import { NestedMenuItem } from "mui-nested-menu"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"

import TileLayer from "@arcgis/core/layers/TileLayer"
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"

const CompareSwipe = () => {
	const { globalIDLeft, globalIDRight } = useParams()
	const navigate = useNavigate()
	const { t, i18n } = useTranslation()

	const [selectedLeftMap, setSelectedLeftMap] = useState(8)
	const [selectedRightMap, setSelectedRightMap] = useState(7)
	const [mapList, setMapList] = useState([])
	const [groupList, setGroupList] = useState([])
	const [selectedGroupValueLeft, setSelectedGroupValueLeft] = useState("1")
	const [selectedGroupValueRight, setSelectedGroupValueRight] = useState("2")

	const [anchorElLeft, setAnchorElLeft] = React.useState(null)
	const openLeft = Boolean(anchorElLeft)

	const handleClickLeft = (e) => setAnchorElLeft(e.currentTarget)

	const handleCloseLeft = () => setAnchorElLeft(null)

	const [anchorElRight, setAnchorElRight] = React.useState(null)
	const openRight = Boolean(anchorElRight)

	const handleClickRight = (e) => setAnchorElRight(e.currentTarget)

	const handleCloseRight = () => setAnchorElRight(null)

	const handleLeftSelect = (event) => {
		handleCloseLeft()

		const mapByIndex = mapList.find((map) => map.index === String(event.target.value))
		navigate(`/vilniausdnr/${i18n.language}/maps/compare/swipe/${mapByIndex.globalid_map}/${globalIDRight}`)

		const swipeWidgetFind = view.ui.find("swipe-layers")
		if (swipeWidgetFind !== null) {
			view.ui.remove(swipeWidgetFind)
			swipeWidgetFind.destroy()
		}

		map.remove(mapList[selectedLeftMap])
		map.add(mapList[event.target.value])

		const swipe = new Swipe({
			view: view,
			leadingLayers: [mapList[event.target.value]],
			trailingLayers: [mapList[selectedRightMap]],
			direction: "horizontal",
			position: 50,
			id: "swipe-layers",
		})
		view.ui.add(swipe)

		setSelectedLeftMap(event.target.value)
	}

	const handleRightSelect = (event) => {
    handleCloseRight()

		const mapByIndex = mapList.find((map) => map.index === String(event.target.value))
		navigate(`/vilniausdnr/${i18n.language}/maps/compare/swipe/${globalIDLeft}/${mapByIndex.globalid_map}`)

		const swipeWidgetFind = view.ui.find("swipe-layers")
		if (swipeWidgetFind !== null) {
			view.ui.remove(swipeWidgetFind)
			swipeWidgetFind.destroy()
		}

		map.remove(mapList[selectedRightMap])
		map.add(mapList[event.target.value])

		const swipe = new Swipe({
			view: view,
			leadingLayers: [mapList[selectedLeftMap]],
			trailingLayers: [mapList[event.target.value]],
			direction: "horizontal",
			position: 50,
			id: "swipe-layers",
		})
		view.ui.add(swipe)

		setSelectedRightMap(event.target.value)
	}

	useEffect(() => {
		const tempMaps = []

		maps
			.queryFeatures({
				where: "1=1",
				outFields: ["*"],
			})
			.then((response) => {
				const mapGroupSet = new Set()

				if (globalIDLeft && globalIDRight) {
					for (let feature in response.features) {
						mapGroupSet.add(response.features[feature].attributes.Grupe)

						if (response.features[feature].attributes.Tipas === "Tile Layer") {
							const mapLayer = new TileLayer({
								url: response.features[feature].attributes.Nuoroda,
								title: response.features[feature].attributes.Pavadinimas,
								group: response.features[feature].attributes.Grupe,
								globalid_map: response.features[feature].attributes.GlobalID_zemelapio,
								index: feature,
							})
							tempMaps.push(mapLayer)
						} else if (response.features[feature].attributes.Tipas === "Map Layer") {
							let subLayer
							let urlNew

							if (response.features[feature].attributes.Nuoroda) {
								const urlSplit = response.features[feature].attributes.Nuoroda.split("/")
								subLayer = parseInt(urlSplit.slice(-1))
								urlNew = urlSplit.slice(0, -1).join("/")
							}

							const mapLayer = new MapImageLayer({
								url: isNaN(subLayer) ? response.features[feature].attributes.Nuoroda : urlNew,
								sublayers: isNaN(subLayer) ? [{}] : [{ id: subLayer }],
								title: response.features[feature].attributes.Pavadinimas,
								group: response.features[feature].attributes.Grupe,
								globalid_map: response.features[feature].attributes.GlobalID_zemelapio,
								index: feature,
							})
							tempMaps.push(mapLayer)
						}
					}
				} else {
					const defaultMapLeft = response.features.find(
						(map) => map.attributes.GlobalID_zemelapio === "42e1492a-d5ac-4d09-ac03-90a6efb54d6e"
					)
					const defaultMapRight = response.features.find(
						(map) => map.attributes.GlobalID_zemelapio === "c0b7610e-3e12-4e03-a915-9673d1906502"
					)
					navigate(
						`${defaultMapLeft.attributes.GlobalID_zemelapio}/${defaultMapRight.attributes.GlobalID_zemelapio}`
					)
				}

				setGroupList([...mapGroupSet])
				setMapList(tempMaps)

				const mapByIdLeft = tempMaps.find((map) => map.globalid_map === globalIDLeft)
				const mapByIdRight = tempMaps.find((map) => map.globalid_map === globalIDRight)

				const swipeWidgetFind = view.ui.find("swipe-layers")
				if (swipeWidgetFind !== null) {
					view.ui.remove(swipeWidgetFind)
					swipeWidgetFind.destroy()
				}

				map.removeAll()
				map.addMany([tempMaps[mapByIdLeft.index], tempMaps[mapByIdRight.index]])

				const swipe = new Swipe({
					view: view,
					leadingLayers: [tempMaps[mapByIdLeft.index]],
					trailingLayers: [tempMaps[mapByIdRight.index]],
					direction: "horizontal",
					position: 50,
					id: "swipe-layers",
				})

				view.ui.add(swipe)

				setSelectedGroupValueLeft([...mapGroupSet].indexOf(mapByIdLeft.group))
				setSelectedLeftMap(mapByIdLeft.index)
				setSelectedGroupValueRight([...mapGroupSet].indexOf(mapByIdRight.group))
				setSelectedRightMap(mapByIdRight.index)
			})
	}, [globalIDLeft, globalIDRight])

	useEffect(() => {
		view.when(() => {
			const swipeWidgetFind = view.ui.find("swipe-layers")
			const swipeSelectBottom = document.getElementById("swipe-select-bottom")
			swipeSelectBottom.style.left = "0%"
			swipeWidgetFind.watch("position", (newPos) => {
				swipeSelectBottom.style.left = `${newPos - 50}%`
			})
		})
	}, [selectedLeftMap, selectedRightMap])

	useEffect(() => {
		return () => {
			const swipeWidgetFind = view.ui.find("swipe-layers")
			if (swipeWidgetFind !== null) {
				view.ui.remove(swipeWidgetFind)
				swipeWidgetFind.destroy()
			}

			map.removeAll()
		}
	}, [])

	return (
			<Grid
				sx={{
					backgroundColor: "yellow",
					width: "100%",
					height: "0%",
					position: "relative",
				}}
				container
				direction="row"
				justifyContent="center"
				alignItems="flex-start"
				id="swipe-select-bottom"
			>
				{mapList.length && (
					<>
						<Button
							sx={{
								bottom: 16,
								mt: -7.5,
								mr: 85,
								width: "auto",
								height: "45px",
								borderRadius: "30px",
								backgroundColor: "white",
								"&:hover": { backgroundColor: "white" },
								textTransform: "none",
							}}
							onClick={handleClickLeft}
							endIcon={<ArrowDropDownIcon />}
						>
							<Typography sx={{ color: "#D72E30" }}>
								<Typography sx={{ color: "black", display: "inline" }}>Kairys žemėlapis: </Typography>
								{mapList[selectedLeftMap].title}
							</Typography>
						</Button>
						<Menu
							anchorEl={anchorElLeft}
							open={openLeft}
							onClose={handleCloseLeft}
							anchorOrigin={{
								vertical: "top",
								horizontal: "center",
							}}
							transformOrigin={{
								vertical: "bottom",
								horizontal: "center",
							}}
						>
							{groupList.map((group, groupIndex) => (
								<NestedMenuItem
									sx={{
										color: groupIndex === selectedGroupValueLeft && "#D72E30",
                    backgroundColor: groupIndex === selectedGroupValueLeft && "#F7D5D6"
									}}
									rightIcon={<ArrowDropDownIcon />}
									label={group}
									key={groupIndex}
									parentMenuOpen={openLeft}
								>
									{mapList.map((map, index) =>
										map.group === group ? (
											<MenuItem
												sx={{
													whiteSpace: "unset",
													color: map.globalid_map === globalIDLeft && "#D72E30",
													backgroundColor: map.globalid_map === globalIDLeft && "#F7D5D6",
													justifyContent: "center",
												}}
												key={index}
												value={index}
												onClick={handleLeftSelect}
											>
												{map.title}
											</MenuItem>
										) : null
									)}
								</NestedMenuItem>
							))}
						</Menu>
					</>
				)}
				{mapList.length && (
					<>
						<Button
							sx={{
                bottom: 16,
                mt: -7.5,
                ml: 85,
								width: "auto",
								height: "45px",
								borderRadius: "30px",
								backgroundColor: "white",
								"&:hover": { backgroundColor: "white" },
								textTransform: "none",
							}}
							onClick={handleClickRight}
							endIcon={<ArrowDropDownIcon />}
						>
							<Typography sx={{ color: "#D72E30" }}>
								<Typography sx={{ color: "black", display: "inline" }}>Dešinys žemėlapis: </Typography>
								{mapList[selectedRightMap].title}
							</Typography>
						</Button>
						<Menu
							anchorEl={anchorElRight}
							open={openRight}
							onClose={handleCloseRight}
							anchorOrigin={{
								vertical: "top",
								horizontal: "center",
							}}
							transformOrigin={{
								vertical: "bottom",
								horizontal: "center",
							}}
						>
							{groupList.map((group, groupIndex) => (
								<NestedMenuItem
									sx={{
										color: groupIndex === selectedGroupValueRight && "#D72E30",
										backgroundColor: groupIndex === selectedGroupValueRight && "#F7D5D6",
									}}
									rightIcon={<ArrowDropDownIcon />}
									label={group}
									key={groupIndex}
									parentMenuOpen={openRight}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }}
								>
									{mapList.map((map, index) =>
										map.group === group ? (
											<MenuItem
												sx={{
													whiteSpace: "unset",
													color: map.globalid_map === globalIDRight && "#D72E30",
													backgroundColor: map.globalid_map === globalIDRight && "#F7D5D6",
													justifyContent: "center",
												}}
												key={index}
												value={index}
												onClick={handleRightSelect}
											>
												{map.title}
											</MenuItem>
										) : null
									)}
								</NestedMenuItem>
							))}
						</Menu>
					</>
				)}
			</Grid>
	)
}

export default CompareSwipe
