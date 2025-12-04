import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export default function CardDashboard({
    data,
    isLoading
}:{
    data?: any,
    isLoading: boolean
}){
    return(
        <Card>
            <CardHeader>
                <CardTitle></CardTitle>
            </CardHeader>
        </Card>
    )
}