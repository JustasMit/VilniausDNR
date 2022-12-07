import React, { useEffect, useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import { objects, map, periods } from "../../../utils/streetsArcgisItems"
import CompareTimeline from "../compare/CompareTimeline"
import CompareSwipe from "../compare/CompareSwipe"
import CompareWindow from "../compare/CompareWindow"
import ObjectPopupTimeline from "../../../components/Streets/popup/ObjectPopupTimeline"

import ButtonGroup from "@mui/material/ButtonGroup"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import CompareType from "./CompareType"

const CompareLayers = (props) => {
	const navigate = useNavigate()
	const [initialPeriod, setInitialPeriod] = useState(periods[0])
	const [toggle1808, setToggle1808] = useState(true)
	const [toggle1845, setToggle1845] = useState(false)
	const [toggle1911, setToggle1911] = useState(false)
	const [toggle1938, setToggle1938] = useState(false)
	const [toggle1977, setToggle1977] = useState(false)
	const [toggle2021, setToggle2021] = useState(false)

	useEffect(() => {
		if (window.location.href.includes("compare")) {
			props.setHistoryToggle(true)
		} else {
			map.removeAll()
			map.add(objects)
			props.setHistoryToggle(false)
		}
	}, [])

	return (
		<>
			<Grid variant="compareType" container direction="row" justifyContent="center" alignItems="flex-start">
				<ButtonGroup sx={{ mt: 1.5 }}>
					<Button
						variant="timeline"
						sx={{
							width: 95,
							backgroundColor: props.historyToggle ? "white" : "#D72E30",
							"&:hover": {
								backgroundColor: props.historyToggle ? "white" : "#D72E30",
							},
						}}
						onClick={() => {
							map.removeAll()
							map.add(objects)
							props.setHistoryToggle(false)
							navigate("")
						}}
					>
						<Typography variant="button">dabartis</Typography>
					</Button>
					<Button
						variant="timeline"
						sx={{
							width: 95,
							backgroundColor: props.historyToggle ? "#D72E30" : "white",
							"&:hover": {
								backgroundColor: props.historyToggle ? "#D72E30" : "white",
							},
						}}
						onClick={() => {
							const url = window.location.href
							if (!url.includes("compare")) {
								props.setHistoryToggle(true)
								navigate("compare/timeline")
							}
						}}
					>
						<Typography variant="button">istorija</Typography>
					</Button>
				</ButtonGroup>
			</Grid>

			<Routes>
				<Route
					path="compare/timeline"
					element={
						<>
							<CompareTimeline
								setMapQuery={props.setMapQuery}
								initialPeriod={initialPeriod}
								toggle1808={toggle1808}
								setToggle1808={setToggle1808}
								toggle1845={toggle1845}
								setToggle1845={setToggle1845}
								toggle1911={toggle1911}
								setToggle1911={setToggle1911}
								toggle1938={toggle1938}
								setToggle1938={setToggle1938}
								toggle1977={toggle1977}
								setToggle1977={setToggle1977}
								toggle2021={toggle2021}
								setToggle2021={setToggle2021}
							/>
							<CompareType />
						</>
					}
				/>
				<Route
					path="compare/timeline/:globalID"
					element={
						<>
							<ObjectPopupTimeline
								mapQuery={props.mapQuery}
								setSelectedObject={props.setSelectedObject}
								initialLoading={props.initialLoading}
								setInitialPeriod={setInitialPeriod}
								setHistoryToggle={props.setHistoryToggle}
							/>
							<CompareTimeline
								setMapQuery={props.setMapQuery}
								initialPeriod={initialPeriod}
								toggle1808={toggle1808}
								setToggle1808={setToggle1808}
								toggle1845={toggle1845}
								setToggle1845={setToggle1845}
								toggle1911={toggle1911}
								setToggle1911={setToggle1911}
								toggle1938={toggle1938}
								setToggle1938={setToggle1938}
								toggle1977={toggle1977}
								setToggle1977={setToggle1977}
								toggle2021={toggle2021}
								setToggle2021={setToggle2021}
							/>
							<CompareType />
						</>
					}
				/>
				<Route
					path="compare/swipe"
					element={
						<>
							<CompareSwipe />
							<CompareType />
						</>
					}
				/>
				<Route
					path="compare/window"
					element={
						<>
							<CompareWindow setToggleCompareWindow={props.setToggleCompareWindow} />
							<CompareType />
						</>
					}
				/>
			</Routes>
		</>
	)
}

export default CompareLayers
