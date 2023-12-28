const express = require('express');
const router = express.Router();

const {reporting,getAllReports,getReportsByReportID,
    getReportsByUserID,getReportsByIssue,getReportsBetweenTwoDates,getReportsByDate,
    getReportsByDateAndBetweenTwoTimes,getReportsBetweenTwoTimes,
    getReportsBetweenTwoTimesAndDates,getReportsFromStartDateAndTimeToEndDateAndTime,
getReportsByTime, deleteMyAccount} = require('./report.js');


router.post('/user/reporting', reporting )
router.get('/user/getAllReports', getAllReports )
router.get('/user/getReportsByReportID', getReportsByReportID )
router.get('/user/getReportsByUserID', getReportsByUserID )
router.get('/user/getReportsByIssue', getReportsByIssue )
router.get('/user/getReportsBetweenTwoDates', getReportsBetweenTwoDates )
router.get('/user/getReportsByDate', getReportsByDate )
router.get('/user/getReportsByDateAndBetweenTwoTimes', getReportsByDateAndBetweenTwoTimes )
router.get('/user/getReportsBetweenTwoTimes', getReportsBetweenTwoTimes )
router.get('/user/getReportsBetweenTwoTimesAndDates', getReportsBetweenTwoTimesAndDates )
router.get('/user/getReportsFromStartDateAndTimeToEndDateAndTime', getReportsFromStartDateAndTimeToEndDateAndTime )
router.get('/user/getReportsByTime', getReportsByTime )
router.delete('/user/deleteMyAccount', deleteMyAccount )


module.exports = router;
