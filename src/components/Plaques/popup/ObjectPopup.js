import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MuiLinkify from "material-ui-linkify"
import { useTranslation } from "react-i18next"

import { view, objects } from "../../../utils/plaquesArcgisItems"

import { styled } from "@mui/material/styles"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import ShareIcon from "@mui/icons-material/Share"
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Box from "@mui/material/Box"
import Pagination from "@mui/material/Pagination"
import CircularProgress from "@mui/material/CircularProgress"
import useMediaQuery from "@mui/material/useMediaQuery"
import Backdrop from "@mui/material/Backdrop"
import Fade from "@mui/material/Fade"
import Button from "@mui/material/Button"

import Carousel from "react-material-ui-carousel"

let highlight
const ObjectPopup = (props) => {
	const { globalID } = useParams()
	const navigate = useNavigate()
	const { t, i18n } = useTranslation()

	const [objectAttr, setObjectAttr] = useState([])
	const [objectPer, setObjectPer] = useState([])
	const [objectAtt, setObjectAtt] = useState([])
	const [loading, setLoading] = useState(true)
	const [queryObjects, setQueryObjects] = useState([])
	const [popupOpen, setPopupOpen] = useState(false)
	const [page, setPage] = useState(1)
	const [pageCount, setPageCount] = useState(1)
	const [shareTooltip, setShareTooltip] = useState(false)

	const handlePage = (event, value) => {
		navigate(
			`/vilniausdnr/${i18n.language}/plaques/object/${queryObjects[value - 1].attributes.GlobalID.replace(
				/[{}]/g,
				""
			)}`
		)
	}

	const BootstrapTooltip = styled(({ className, ...props }) => (
		<Tooltip {...props} arrow classes={{ popper: className }} />
	))(({ theme }) => ({
		[`& .${tooltipClasses.arrow}`]: {
			color: theme.palette.secondary.main,
		},
		[`& .${tooltipClasses.tooltip}`]: {
			backgroundColor: theme.palette.secondary.main,
			fontSize: 15,
		},
	}))

	const handleShare = async () => {
		await navigator.clipboard.writeText(window.location.href)
		setShareTooltip(true)
	}

	useEffect(() => {
		if (!props.initialLoading) {
			setPopupOpen(true)
			setLoading(true)

			let found = false
			for (let obj in props.mapQuery) {
				if (props.mapQuery[obj].attributes.GlobalID.replace(/[{}]/g, "") === globalID) {
					setPage(parseInt(obj) + 1)
					found = true
				}
			}

			if (found) {
				setQueryObjects(props.mapQuery)
				setPageCount(props.mapQuery.length)
			} else {
				setPageCount(1)
				setPage(1)
			}

			view
				.whenLayerView(objects)
				.then((objectsView) => {
					let query = objectsView.createQuery()
					query.where = `GlobalID = '{${globalID}}'`

					objectsView
						.queryFeatures(query)
						.then((response) => {
							if (highlight) {
								highlight.remove()
							}

							if (response.features.length === 0) {
								navigate(`/vilniausdnr/${i18n.language}/plaques`)
								return
							}

							view.goTo({
								target: response.features[0].geometry,
								zoom: 8,
							})
							highlight = objectsView.highlight(response.features[0])
							props.setSelectedObject(`${globalID}`)

							return response
						})
						.then((response) => {
							const allAttributes = []

							let count = 0
							for (let attr in response.features[0].attributes) {
								if (
									response.features[0].attributes[attr] === null ||
									response.features[0].attributes[attr] === "" ||
									response.features[0].attributes[attr] === 0 ||
									attr === "OBJECTID" ||
									attr === "IDENTIFIK" ||
									attr === "REG_TURTAS" ||
									attr === "VERTE" ||
									attr === "UZSAKOVAS" ||
									attr === "PRIZIURI" ||
									attr === "PASTABA" ||
									attr === "Atmobj_id_temp" ||
									attr === "last_edited_user" ||
									attr === "last_edited_date" ||
									attr === "SHAPE" ||
									attr === "GlobalID" ||
									attr === "OBJ_FOTO" ||
									attr === "created_user" ||
									attr === "created_date"
								) {
								} else {
									const obj = {}

									obj.alias = response.features[0].layer.fields[count].alias
									if (response.features[0].layer.fields[count].domain === null) {
										obj.value = response.features[0].attributes[attr]
									} else {
										for (let code in response.features[0].layer.fields[count].domain.codedValues) {
											if (
												response.features[0].layer.fields[count].domain.codedValues[code].code ===
												response.features[0].attributes[attr]
											) {
												obj.value = response.features[0].layer.fields[count].domain.codedValues[code].name
												obj.code = response.features[0].layer.fields[count].domain.codedValues[code].code
											}
										}
									}

									obj.field = attr
									allAttributes.push(obj)
								}
								count++
							}
							setObjectAttr(allAttributes)
							return response.features[0].attributes.OBJECTID
						})
						.then((OBJECTID) => {
							const allPersons = []
							objects
								.queryRelatedFeatures({
									outFields: ["Asmenybes_ID", "Vardas_lietuviskai", "Pavarde_lietuviskai"],
									relationshipId: 0,
									objectIds: OBJECTID,
								})
								.then((response) => {
									if (Object.keys(response).length === 0) {
										setObjectPer([])
										return
									}
									Object.keys(response).forEach((objectId) => {
										const person = response[objectId].features
										person.forEach((person) => {
											allPersons.push(person)
										})
									})
									setObjectPer(allPersons)
								})
								.catch((error) => {
									console.error(error)
								})

							const allAttachments = []
							objects
								.queryAttachments({
									attachmentTypes: ["image/jpeg"],
									objectIds: OBJECTID,
								})
								.then((response) => {
									console.log(response)
									if (Object.keys(response).length === 0) {
										setObjectAtt([])
										return
									}
									Object.keys(response).forEach((objectId) => {
										const attachment = response[objectId]
										attachment.forEach((attachment) => {
											allAttachments.push(attachment)
										})
									})
									setObjectAtt(allAttachments)
								})
								.catch((error) => {
									console.error(error)
								})
						})
						.then(() => {
							setLoading(false)
						})
						.catch((error) => {
							console.error(error)
						})
				})
				.catch((error) => {
					console.error(error)
				})
		}
	}, [globalID, props.initialLoading])

	useEffect(() => {
		return () => {
			setPage(1)
			setPageCount(1)
			props.setSelectedObject("")
			setQueryObjects([])
			setPopupOpen(false)

			if (highlight) {
				highlight.remove()
			}
		}
	}, [])

	const matches = useMediaQuery("(min-width:995px)")
	return (
		<>
			{!matches && <Backdrop sx={{ color: "#fff", zIndex: 2 }} open={popupOpen}></Backdrop>}
			<Fade in={true} timeout={300} unmountOnExit>
				<Card variant="popup">
					<CardContent sx={{ pt: 0 }}>
						{pageCount > 1 ? (
							<Box component="div" display="flex" justifyContent="center" alignItems="center">
								<Pagination color="secondary" count={pageCount} page={page} onChange={handlePage} />
							</Box>
						) : null}
						{loading ? (
							<Box display="flex" justifyContent="center" alignItems="center">
								<CircularProgress />
							</Box>
						) : (
							<>
								{/* {objectAtt.length
									? Object.keys(objectAtt).map((att) => (
											<Box sx={{ mt: 1 }} key={att}>
												<a href={`${objectAtt[att].url}`} target="_blank">
													<img
														style={{ maxWidth: "100%", maxHeight: "auto" }}
														src={`${objectAtt[att].url}`}
													/>
												</a>
											</Box>
									  ))
									: null} */}

								<IconButton
									color="primary"
									aria-label="close"
									size="small"
									onClick={() => {
										navigate(`/vilniausdnr/${i18n.language}/plaques`)
									}}
									sx={{
										mt: 1,
										mr: 1,
										position: "fixed",
										zIndex: 10,
										right: 0,
										backgroundColor: "#F6F6F6",
										"&:hover": {
											transition: "0.3s",
											backgroundColor: "white",
										},
									}}
								>
									<CloseIcon sx={{ fontSize: 25 }} />
								</IconButton>

								{objectAtt.length ? (
									<Carousel
										sx={{ mx: -2, mt: 0 }}
										navButtonsAlwaysVisible={true}
										animation="slide"
										swipe={false}
										duration={1000}
										autoPlay={false}
										navButtonsProps={{
											style: {
												backgroundColor: "rgba(246, 246, 246, 0.8)",
												color: "black",
												// "&:hover": {
												// 	transition: "0.3s",
												// 	backgroundColor: "white",
												// },
											},
										}}
										indicatorIconButtonProps={{
											style: {
												padding: 2,
												color: "#F6F6F6",
											},
										}}
										activeIndicatorIconButtonProps={{
											style: {
												color: "#D42323",
											},
										}}
										indicatorContainerProps={{
											style: {
												marginTop: -40,
												position: "absolute",
												zIndex: 5,
											},
										}}
									>
										{Object.keys(objectAtt).map((att) => (
											<a href={`${objectAtt[att].url}`} target="_blank">
												<img style={{ maxWidth: "100%" }} src={`${objectAtt[att].url}`} />
											</a>
										))}
									</Carousel>
								) : null}

								<CardHeader
									sx={{ p: 0 }}
									action={
										<>
											<BootstrapTooltip
												open={shareTooltip}
												leaveDelay={1000}
												title={t(`plaques.objectPopup.shareUrl`)}
												arrow
												placement="top"
												onClose={() => {
													setShareTooltip(false)
												}}
											>
												<IconButton color="secondary" aria-label="share" size="large" onClick={handleShare}>
													<ShareIcon style={{ fontSize: 30 }} />
												</IconButton>
											</BootstrapTooltip>
										</>
									}
									title={Object.keys(objectAttr).map((attr) =>
										objectAttr[attr].field === "OBJ_PAV" ? objectAttr[attr].value : null
									)}
									titleTypographyProps={{ color: "white", fontWeight: "bold" }}
								/>
								{/* <TableContainer sx={{ mb: 1 }} component={Paper}>
									<Table size="small">
										<TableBody>
											{Object.keys(objectAttr).map((attr) =>
												objectAttr[attr].field === "OBJ_APRAS" ||
												objectAttr[attr].field === "AUTORIUS" ||
												objectAttr[attr].field === "OBJ_PAV" ||
												objectAttr[attr].field === "SALTINIS" ? null : (
													<TableRow
														key={objectAttr[attr].field}
														sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
													>
														<TableCell component="th" scope="row">
															{t(`plaques.objectPopup.${objectAttr[attr].field}`)}
														</TableCell>
														<TableCell align="right">
															{objectAttr[attr].field === "TIPAS"
																? t(`plaques.options.objects.${objectAttr[attr].code}`)
																: objectAttr[attr].field === "ATMINT_TIP"
																? t(`plaques.options.memories.${objectAttr[attr].code}`)
																: objectAttr[attr].value}
														</TableCell>
													</TableRow>
												)
											)}
										</TableBody>
									</Table>
								</TableContainer> */}

								{Object.keys(objectAttr).map(
									(attr) =>
										objectAttr[attr].field === "OBJ_APRAS" && (
											<Typography sx={{ color: "white" }} variant="body2" component="div">
												{objectAttr[attr].value}
											</Typography>
										)
								)}

								{Object.keys(objectAttr).map(
									(attr) =>
										objectAttr[attr].field === "AUTORIUS" && (
											<Typography sx={{ color: "white" }} variant="h6" component="div">
												{t(`plaques.objectPopup.AUTORIUS`)}
												<Typography sx={{ color: "white" }} variant="body2" component="div">
													{objectAttr[attr].value}
												</Typography>
											</Typography>
										)
								)}

								{Object.keys(objectAttr).map((attr) =>
									objectAttr[attr].field === "SALTINIS" ? (
										<Typography
											sx={{ color: "white" }}
											variant="h6"
											component="div"
											key={objectAttr[attr].field}
										>
											{t(`plaques.objectPopup.${objectAttr[attr].field}`)}
											<MuiLinkify LinkProps={{ target: "_blank", rel: "noopener", rel: "noreferrer" }}>
												<Typography variant="body2" component="div">
													{objectAttr[attr].value}
												</Typography>
											</MuiLinkify>
										</Typography>
									) : null
								)}

								{objectPer.length ? (
									<Typography sx={{ color: "white" }} variant="h6" component="div">
										{objectPer.length > 1
											? t("plaques.objectPopup.relatedMany")
											: t("plaques.objectPopup.relatedOne")}
										<Typography component="div">
											{Object.keys(objectPer).map((per) => (
												<div key={per}>
													<Link
														sx={{ mt: 0.5 }}
														target="_blank"
														href={
															"https://zemelapiai.vplanas.lt" +
															`/vilniausdnr/${i18n.language}/persons/${objectPer[
																per
															].attributes.Asmenybes_ID.replace(/[{}]/g, "")}`
														}
														rel="noopener"
														textAlign="left"
														variant="body2"
													>{`${objectPer[per].attributes.Vardas_lietuviskai} ${objectPer[per].attributes.Pavarde_lietuviskai}`}</Link>
													<br></br>
												</div>
											))}
										</Typography>
									</Typography>
								) : null}
								{/* {objectAtt.length
									? Object.keys(objectAtt).map((att) => (
											<Box sx={{ mt: 1 }} key={att}>
												<a href={`${objectAtt[att].url}`} target="_blank">
													<img
														style={{ maxWidth: "100%", maxHeight: "auto" }}
														src={`${objectAtt[att].url}`}
													/>
												</a>
											</Box>
									  ))
									: null} */}
							</>
						)}
					</CardContent>
				</Card>
			</Fade>
		</>
	)
}

export default ObjectPopup
